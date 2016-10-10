import { timeStart, timeEnd } from './utils/flushTime.js';
import { parse } from 'acorn/src/index.js';
import MagicString from 'magic-string';
import { assign, blank, deepClone, keys } from './utils/object.js';
import { basename, extname } from './utils/path.js';
import getLocation from './utils/getLocation.js';
import makeLegalIdentifier from './utils/makeLegalIdentifier.js';
import SOURCEMAPPING_URL from './utils/sourceMappingURL.js';
import error from './utils/error.js';
import relativeId from './utils/relativeId.js';
import { SyntheticNamespaceDeclaration } from './Declaration.js';
import extractNames from './ast/utils/extractNames.js';
import enhance from './ast/enhance.js';
import ModuleScope from './ast/scopes/ModuleScope.js';

function tryParse ( code, comments, acornOptions, id ) {
	try {
		return parse( code, assign({
			ecmaVersion: 7,
			sourceType: 'module',
			onComment: ( block, text, start, end ) => comments.push({ block, text, start, end }),
			preserveParens: true
		}, acornOptions ));
	} catch ( err ) {
		err.code = 'PARSE_ERROR';
		err.file = id; // see above - not necessarily true, but true enough
		err.message += ` in ${id}`;
		throw err;
	}
}

export default class Module {
	constructor ({ id, code, originalCode, originalSourceMap, ast, sourceMapChain, resolvedIds, bundle }) {
		this.code = code;
		this.originalCode = originalCode;
		this.originalSourceMap = originalSourceMap;
		this.sourceMapChain = sourceMapChain;

		this.comments = [];

		timeStart( 'ast' );

		this.ast = ast || tryParse( code, this.comments, bundle.acornOptions, id ); // TODO what happens to comments if AST is provided?
		this.astClone = deepClone( this.ast );

		timeEnd( 'ast' );

		this.bundle = bundle;
		this.id = id;
		this.excludeFromSourcemap = /\0/.test( id );
		this.context = bundle.getModuleContext( id );

		// all dependencies
		this.sources = [];
		this.dependencies = [];
		this.resolvedIds = resolvedIds || blank();

		// imports and exports, indexed by local name
		this.imports = blank();
		this.exports = blank();
		this.exportsAll = blank();
		this.reexports = blank();

		this.exportAllSources = [];
		this.exportAllModules = null;

		// By default, `id` is the filename. Custom resolvers and loaders
		// can change that, but it makes sense to use it for the source filename
		this.magicString = new MagicString( code, {
			filename: this.excludeFromSourcemap ? null : id, // don't include plugin helpers in sourcemap
			indentExclusionRanges: []
		});

		// remove existing sourceMappingURL comments
		const pattern = new RegExp( `\\/\\/#\\s+${SOURCEMAPPING_URL}=.+\\n?`, 'g' );
		let match;
		while ( match = pattern.exec( code ) ) {
			this.magicString.remove( match.index, match.index + match[0].length );
		}

		this.declarations = blank();
		this.type = 'Module'; // TODO only necessary so that Scope knows this should be treated as a function scope... messy
		this.scope = new ModuleScope( this );

		timeStart( 'analyse' );

		this.analyse();

		timeEnd( 'analyse' );

		this.strongDependencies = [];
	}

	addExport ( node ) {
		const source = node.source && node.source.value;

		// export { name } from './other.js'
		if ( source ) {
			if ( !~this.sources.indexOf( source ) ) this.sources.push( source );

			if ( node.type === 'ExportAllDeclaration' ) {
				// Store `export * from '...'` statements in an array of delegates.
				// When an unknown import is encountered, we see if one of them can satisfy it.
				this.exportAllSources.push( source );
			}

			else {
				node.specifiers.forEach( specifier => {
					const name = specifier.exported.name;

					if ( this.exports[ name ] || this.reexports[ name ] ) {
						throw new Error( `A module cannot have multiple exports with the same name ('${name}')` );
					}

					this.reexports[ name ] = {
						start: specifier.start,
						source,
						localName: specifier.local.name,
						module: null // filled in later
					};
				});
			}
		}

		// export default function foo () {}
		// export default foo;
		// export default 42;
		else if ( node.type === 'ExportDefaultDeclaration' ) {
			const identifier = ( node.declaration.id && node.declaration.id.name ) || node.declaration.name;

			if ( this.exports.default ) {
				// TODO indicate location
				throw new Error( 'A module can only have one default export' );
			}

			this.exports.default = {
				localName: 'default',
				identifier
			};

			// create a synthetic declaration
			//this.declarations.default = new SyntheticDefaultDeclaration( node, identifier || this.basename() );
		}

		// export var { foo, bar } = ...
		// export var foo = 42;
		// export var a = 1, b = 2, c = 3;
		// export function foo () {}
		else if ( node.declaration ) {
			const declaration = node.declaration;

			if ( declaration.type === 'VariableDeclaration' ) {
				declaration.declarations.forEach( decl => {
					extractNames( decl.id ).forEach( localName => {
						this.exports[ localName ] = { localName };
					});
				});
			} else {
				// export function foo () {}
				const localName = declaration.id.name;
				this.exports[ localName ] = { localName };
			}
		}

		// export { foo, bar, baz }
		else {
			if ( node.specifiers.length ) {
				node.specifiers.forEach( specifier => {
					const localName = specifier.local.name;
					const exportedName = specifier.exported.name;

					if ( this.exports[ exportedName ] || this.reexports[ exportedName ] ) {
						throw new Error( `A module cannot have multiple exports with the same name ('${exportedName}')` );
					}

					// `export { default as foo }` – special case. We want importers
					// to use the UnboundDefaultExport proxy, not the original declaration
					if ( exportedName === 'default' ) {
						this.exports[ exportedName ] = { localName: 'default' };
					} else {
						this.exports[ exportedName ] = { localName };
					}
				});
			} else {
				this.bundle.onwarn( `Module ${this.id} has an empty export declaration` );
			}
		}
	}

	addImport ( node ) {
		const source = node.source.value;

		if ( !~this.sources.indexOf( source ) ) this.sources.push( source );

		node.specifiers.forEach( specifier => {
			const localName = specifier.local.name;

			if ( this.imports[ localName ] ) {
				const err = new Error( `Duplicated import '${localName}'` );
				err.file = this.id;
				err.loc = getLocation( this.code, specifier.start );
				throw err;
			}

			const isDefault = specifier.type === 'ImportDefaultSpecifier';
			const isNamespace = specifier.type === 'ImportNamespaceSpecifier';

			const name = isDefault ? 'default' : isNamespace ? '*' : specifier.imported.name;
			this.imports[ localName ] = { source, specifier, name, module: null };
		});
	}

	analyse () {
		enhance( this.ast, this, this.comments );

		// discover this module's imports and exports
		let lastNode;

		for ( const node of this.ast.body ) {
			if ( node.isImportDeclaration ) {
				this.addImport( node );
			} else if ( node.isExportDeclaration ) {
				this.addExport( node );
			}

			if ( lastNode ) lastNode.next = node.leadingCommentStart || node.start;
			lastNode = node;
		}
	}

	basename () {
		const base = basename( this.id );
		const ext = extname( this.id );

		return makeLegalIdentifier( ext ? base.slice( 0, -ext.length ) : base );
	}

	bindImportSpecifiers () {
		[ this.imports, this.reexports ].forEach( specifiers => {
			keys( specifiers ).forEach( name => {
				const specifier = specifiers[ name ];

				const id = this.resolvedIds[ specifier.source ];
				specifier.module = this.bundle.moduleById.get( id );
			});
		});

		this.exportAllModules = this.exportAllSources.map( source => {
			const id = this.resolvedIds[ source ];
			return this.bundle.moduleById.get( id );
		});

		this.sources.forEach( source => {
			const id = this.resolvedIds[ source ];
			const module = this.bundle.moduleById.get( id );

			if ( !module.isExternal ) this.dependencies.push( module );
		});
	}

	bindReferences () {
		for ( const node of this.ast.body ) {
			node.bind( this.scope );
		}

		// if ( this.declarations.default ) {
		// 	if ( this.exports.default.identifier ) {
		// 		const declaration = this.trace( this.exports.default.identifier );
		// 		if ( declaration ) this.declarations.default.bind( declaration );
		// 	}
		// }
	}

	findParent () {
		// TODO what does it mean if we're here?
		return null;
	}

	findScope () {
		return this.scope;
	}

	getExports () {
		const exports = blank();

		keys( this.exports ).forEach( name => {
			exports[ name ] = true;
		});

		keys( this.reexports ).forEach( name => {
			exports[ name ] = true;
		});

		this.exportAllModules.forEach( module => {
			if ( module.isExternal ) return; // TODO

			module.getExports().forEach( name => {
				if ( name !== 'default' ) exports[ name ] = true;
			});
		});

		return keys( exports );
	}

	namespace () {
		if ( !this.declarations['*'] ) {
			this.declarations['*'] = new SyntheticNamespaceDeclaration( this );
		}

		return this.declarations['*'];
	}

	render ( es, legacy ) {
		const magicString = this.magicString.clone();

		for ( const node of this.ast.body ) {
			node.render( magicString, es );
		}

		if ( this.namespace().needsNamespaceBlock ) {
			magicString.append( '\n\n' + this.namespace().renderBlock( es, legacy, '\t' ) ); // TODO use correct indentation
		}

		return magicString.trim();
	}

	run () {
		for ( const node of this.ast.body ) {
			if ( node.hasEffects( this.scope ) ) {
				node.run( this.scope );
			}
		}
	}

	toJSON () {
		return {
			id: this.id,
			dependencies: this.dependencies.map( module => module.id ),
			code: this.code,
			originalCode: this.originalCode,
			ast: this.astClone,
			sourceMapChain: this.sourceMapChain,
			resolvedIds: this.resolvedIds
		};
	}

	trace ( name ) {
		// TODO this is slightly circular
		if ( name in this.scope.declarations ) {
			return this.scope.declarations[ name ];
		}

		if ( name in this.imports ) {
			const importDeclaration = this.imports[ name ];
			const otherModule = importDeclaration.module;

			if ( importDeclaration.name === '*' && !otherModule.isExternal ) {
				return otherModule.namespace();
			}

			const declaration = otherModule.traceExport( importDeclaration.name );

			if ( !declaration ) {
				error({
					message: `'${importDeclaration.name}' is not exported by ${relativeId( otherModule.id )} (imported by ${relativeId( this.id )}). For help fixing this error see https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module`,
					file: this.id,
					loc: getLocation( this.code, importDeclaration.specifier.start )
				});
			}

			return declaration;
		}

		return null;
	}

	traceExport ( name ) {
		// export { foo } from './other.js'
		const reexportDeclaration = this.reexports[ name ];
		if ( reexportDeclaration ) {
			const declaration = reexportDeclaration.module.traceExport( reexportDeclaration.localName );

			if ( !declaration ) {
				error({
					message: `'${reexportDeclaration.localName}' is not exported by '${reexportDeclaration.module.id}' (imported by '${this.id}')`,
					file: this.id,
					loc: getLocation( this.code, reexportDeclaration.start )
				});
			}

			return declaration;
		}

		const exportDeclaration = this.exports[ name ];
		if ( exportDeclaration ) {
			const name = exportDeclaration.localName;
			const declaration = this.trace( name );

			return declaration || this.bundle.scope.findDeclaration( name );
		}

		if ( name === 'default' ) return;

		for ( let i = 0; i < this.exportAllModules.length; i += 1 ) {
			const module = this.exportAllModules[i];
			const declaration = module.traceExport( name );

			if ( declaration ) return declaration;
		}
	}
}
