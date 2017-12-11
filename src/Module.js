import { parse, plugins as acornPlugins, tokTypes as tt } from 'acorn';
import MagicString from 'magic-string';
import { locate } from 'locate-character';
import { timeStart, timeEnd } from './utils/flushTime.js';
import { assign, blank, keys } from './utils/object.js';
import { basename, extname } from './utils/path.js';
import { makeLegal } from './utils/identifierHelpers.js';
import getCodeFrame from './utils/getCodeFrame.js';
import { SOURCEMAPPING_URL_RE } from './utils/sourceMappingURL.js';
import error from './utils/error.js';
import relativeId from './utils/relativeId.js';
import NamespaceVariable from './ast/variables/NamespaceVariable';
import extractNames from './ast/utils/extractNames.js';
import enhance from './ast/enhance.js';
import clone from './ast/clone.js';
import ModuleScope from './ast/scopes/ModuleScope.js';
import { encode } from 'sourcemap-codec';
import { SourceMapConsumer } from 'source-map';

// Dynamic Import support for acorn
let moduleDynamicImportsReturnBinding;
tt._import.startsExpr = true;
acornPlugins.dynamicImport = (instance) => {
	instance.extend( 'parseStatement', nextMethod => {
		return function parseStatement ( ...args ) {
			const node = this.startNode();
			if (this.type === tt._import) {
				const nextToken = this.input[this.pos];
				if (nextToken === tt.parenL.label) {
					const expr = this.parseExpression();
					return this.parseExpressionStatement( node, expr );
				}
			}
			return nextMethod.apply(this, args);
		}
	});

	instance.extend( 'parseExprAtom', nextMethod => {
		return function parseExprAtom ( refDestructuringErrors ) {
			if (this.type === tt._import) {
				const node = this.startNode();
				this.next();
				if (this.type !== tt.parenL)
					this.unexpected();
				if (moduleDynamicImportsReturnBinding)
					moduleDynamicImportsReturnBinding.push(node);
				return this.finishNode(node, 'Import');
			}
			return nextMethod.call( this, refDestructuringErrors );
		};
	});
};

function tryParse ( module, acornOptions ) {
	try {
		return parse( module.code, assign( {
			ecmaVersion: 8,
			sourceType: 'module',
			onComment: ( block, text, start, end ) => module.comments.push( { block, text, start, end } ),
			preserveParens: false
		}, acornOptions ) );
	} catch ( err ) {
		module.error( {
			code: 'PARSE_ERROR',
			message: err.message.replace( / \(\d+:\d+\)$/, '' )
		}, err.pos );
	}
}

function includeFully ( node ) {
	node.included = true;
	if ( node.variable && !node.variable.included ) {
		node.variable.includeVariable();
	}
	node.eachChild( includeFully );
}

export default class Module {
	constructor ( { id, code, originalCode, originalSourcemap, ast, sourcemapChain, resolvedIds, resolvedExternalIds, bundle } ) {
		this.code = code;
		this.id = id;
		this.bundle = bundle;
		this.originalCode = originalCode;
		this.originalSourcemap = originalSourcemap;
		this.sourcemapChain = sourcemapChain;

		this.comments = [];
		this.dynamicImports = [];

		timeStart( 'ast' );

		if ( ast ) {
			// prevent mutating the provided AST, as it may be reused on
			// subsequent incremental rebuilds
			this.ast = clone( ast );
			this.astClone = ast;
		} else {
			// We bind the dynamic imports array to the plugin binding above, to get the nodes added
			// to this array during parsing itself. This is faster than having to do a separate walk.
			moduleDynamicImportsReturnBinding = this.dynamicImports;
			this.ast = tryParse( this, bundle.acornOptions ); // TODO what happens to comments if AST is provided?
			moduleDynamicImportsReturnBinding = undefined;
			this.astClone = clone( this.ast );
		}

		timeEnd( 'ast' );

		this.excludeFromSourcemap = /\0/.test( id );
		this.context = bundle.getModuleContext( id );

		// all dependencies
		this.sources = [];
		this.dependencies = [];
		this.resolvedIds = resolvedIds || blank();
		this.resolvedExternalIds = resolvedExternalIds || blank();

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
		} );

		// remove existing sourceMappingURL comments
		this.comments = this.comments.filter( comment => {
			//only one line comment can contain source maps
			const isSourceMapComment = !comment.block && SOURCEMAPPING_URL_RE.test( comment.text );
			if ( isSourceMapComment ) {
				this.magicString.remove( comment.start, comment.end );
			}
			return !isSourceMapComment;
		} );

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
						this.error( {
							code: 'DUPLICATE_EXPORT',
							message: `A module cannot have multiple exports with the same name ('${name}')`
						}, specifier.start );
					}

					this.reexports[ name ] = {
						start: specifier.start,
						source,
						localName: specifier.local.name,
						module: null // filled in later
					};
				} );
			}
		}

		// export default function foo () {}
		// export default foo;
		// export default 42;
		else if ( node.type === 'ExportDefaultDeclaration' ) {
			const identifier = ( node.declaration.id && node.declaration.id.name ) || node.declaration.name;

			if ( this.exports.default ) {
				this.error( {
					code: 'DUPLICATE_EXPORT',
					message: `A module can only have one default export`
				}, node.start );
			}

			this.exports.default = {
				localName: 'default',
				identifier
			};
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
					} );
				} );
			} else {
				// export function foo () {}
				const localName = declaration.id.name;
				this.exports[ localName ] = { localName };
			}
		}

		// export { foo, bar, baz }
		else {
			node.specifiers.forEach( specifier => {
				const localName = specifier.local.name;
				const exportedName = specifier.exported.name;

				if ( this.exports[ exportedName ] || this.reexports[ exportedName ] ) {
					this.error( {
						code: 'DUPLICATE_EXPORT',
						message: `A module cannot have multiple exports with the same name ('${exportedName}')`
					}, specifier.start );
				}

				this.exports[ exportedName ] = { localName };
			} );
		}
	}

	addImport ( node ) {
		const source = node.source.value;

		if ( !~this.sources.indexOf( source ) ) this.sources.push( source );

		node.specifiers.forEach( specifier => {
			const localName = specifier.local.name;

			if ( this.imports[ localName ] ) {
				this.error( {
					code: 'DUPLICATE_IMPORT',
					message: `Duplicated import '${localName}'`
				}, specifier.start );
			}

			const isDefault = specifier.type === 'ImportDefaultSpecifier';
			const isNamespace = specifier.type === 'ImportNamespaceSpecifier';

			const name = isDefault ? 'default' : isNamespace ? '*' : specifier.imported.name;
			this.imports[ localName ] = { source, specifier, name, module: null };
		} );
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

		return makeLegal( ext ? base.slice( 0, -ext.length ) : base );
	}

	bindImportSpecifiers () {
		[ this.imports, this.reexports ].forEach( specifiers => {
			keys( specifiers ).forEach( name => {
				const specifier = specifiers[ name ];

				const id = this.resolvedIds[ specifier.source ] || this.resolvedExternalIds[ specifier.source ];
				specifier.module = this.bundle.moduleById.get( id );
			} );
		} );

		this.exportAllModules = this.exportAllSources.map( source => {
			const id = this.resolvedIds[ source ] || this.resolvedExternalIds[ source ];
			return this.bundle.moduleById.get( id );
		} );

		this.sources.forEach( source => {
			const id = this.resolvedIds[ source ];

			if ( id ) {
				const module = this.bundle.moduleById.get( id );
				this.dependencies.push( module );
			}
		} );
	}

	bindReferences () {
		for ( const node of this.ast.body ) {
			node.bind();
		}
	}

	getOriginalLocation (sourcemapChain, line, column) {
		let location = {
			line,
			column
		};
		const filteredSourcemapChain =
			sourcemapChain.filter(sourcemap => sourcemap.mappings).map(sourcemap => {
				const encodedSourcemap = sourcemap;
				if (sourcemap.mappings) {
					encodedSourcemap.mappings = encode(encodedSourcemap.mappings);
				}
				return encodedSourcemap;
			});
		while (filteredSourcemapChain.length > 0) {
			const sourcemap = filteredSourcemapChain.pop();
			const smc = new SourceMapConsumer(sourcemap);
			location = smc.originalPositionFor({
				line: location.line,
				column: location.column
			});
		}
		return location;
	}

	error ( props, pos ) {
		if ( pos !== undefined ) {
			props.pos = pos;

			const { line, column } = locate( this.code, pos, { offsetLine: 1 } ); // TODO trace sourcemaps

			const location = this.getOriginalLocation(this.sourcemapChain, line, column);

			props.loc = { file: this.id, line: location.line, column: location.column };
			props.frame = getCodeFrame( this.originalCode, location.line, location.column );
		}

		error( props );
	}

	getExports () {
		return keys( this.exports );
	}

	getReexports () {
		const reexports = blank();

		keys( this.reexports ).forEach( name => {
			reexports[ name ] = true;
		} );

		this.exportAllModules.forEach( module => {
			if ( module.isExternal ) {
				reexports[ `*${module.id}` ] = true;
				return;
			}

			module.getExports().concat( module.getReexports() ).forEach( name => {
				if ( name !== 'default' ) reexports[ name ] = true;
			} );
		} );

		return keys( reexports );
	}

	includeAllInBundle () {
		this.ast.body.forEach( includeFully );
	}

	includeInBundle () {
		let addedNewNodes = false;
		this.ast.body.forEach( node => {
			if ( node.shouldBeIncluded() ) {
				if ( node.includeInBundle() ) {
					addedNewNodes = true;
				}
			}
		} );
		return addedNewNodes;
	}

	async processDynamicImports ( resolveDynamicImport ) {
		for ( let node of this.dynamicImports ) {
			let dynamicImportSpecifier = node.parent.arguments[0];
			if ( dynamicImportSpecifier.type === 'TemplateLiteral' ) {
				if ( dynamicImportSpecifier.expressions.length === 0 && dynamicImportSpecifier.quasis.length === 1 )
					dynamicImportSpecifier = dynamicImportSpecifier.quasis[0].value.cooked;
			}
			else if ( dynamicImportSpecifier.type === 'Literal' ) {
				if ( typeof dynamicImportSpecifier.value === 'string' )
					dynamicImportSpecifier = dynamicImportSpecifier.value;
			}

			const replacement = await resolveDynamicImport( dynamicImportSpecifier, this.id );
			if ( replacement ) {
				// string specifier -> direct resolution
				if ( typeof dynamicImportSpecifier === 'string' ) {
					// if we have the module, inline as Promise.resolve(namespace)
					// ensuring that we create a namespace import of it as well
					const replacementModule = this.bundle.moduleById.get(replacement);
					if (replacementModule) {
						const namespace = replacementModule.namespace();
						namespace.includeVariable();
						const identifierName = namespace.getName(true);
						this.magicString.overwrite( node.parent.start, node.parent.end, `Promise.resolve(${identifierName})` );
					}
					// otherwise treat as an external dynamic import resolution
					else {
						this.magicString.overwrite( node.parent.arguments[0].start, node.parent.arguments[0].end, `"${replacement}"` );
					}
				}
				// AST Node -> source replacement
				else {
					this.magicString.overwrite( node.start, node.end, replacement );
				}
			}
		}
	}

	namespace () {
		if ( !this.declarations[ '*' ] ) {
			this.declarations[ '*' ] = new NamespaceVariable( this );
		}

		return this.declarations[ '*' ];
	}

	render ( es, legacy, freeze ) {
		const magicString = this.magicString.clone();

		for ( const node of this.ast.body ) {
			node.render( magicString, es );
		}

		if ( this.namespace().needsNamespaceBlock ) {
			magicString.append( '\n\n' + this.namespace().renderBlock( es, legacy, freeze, '\t' ) ); // TODO use correct indentation
		}

		return magicString.trim();
	}

	toJSON () {
		return {
			id: this.id,
			dependencies: this.dependencies.map( module => module.id ),
			code: this.code,
			originalCode: this.originalCode,
			originalSourcemap: this.originalSourcemap,
			ast: this.astClone,
			sourcemapChain: this.sourcemapChain,
			resolvedIds: this.resolvedIds,
			resolvedExternalIds: this.resolvedExternalIds
		};
	}

	trace ( name ) {
		// TODO this is slightly circular
		if ( name in this.scope.variables ) {
			return this.scope.variables[ name ];
		}

		if ( name in this.imports ) {
			const importDeclaration = this.imports[ name ];
			const otherModule = importDeclaration.module;

			if ( importDeclaration.name === '*' && !otherModule.isExternal ) {
				return otherModule.namespace();
			}

			const declaration = otherModule.traceExport( importDeclaration.name );

			if ( !declaration ) {
				this.error( {
					code: 'MISSING_EXPORT',
					message: `'${importDeclaration.name}' is not exported by ${relativeId( otherModule.id )}`,
					url: `https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module`
				}, importDeclaration.specifier.start );
			}

			return declaration;
		}

		return null;
	}

	traceExport ( name ) {
		// export * from 'external'
		if ( name[ 0 ] === '*' ) {
			const module = this.bundle.moduleById.get( name.slice( 1 ) );
			return module.traceExport( '*' );
		}

		// export { foo } from './other.js'
		const reexportDeclaration = this.reexports[ name ];
		if ( reexportDeclaration ) {
			const declaration = reexportDeclaration.module.traceExport( reexportDeclaration.localName );

			if ( !declaration ) {
				this.error( {
					code: 'MISSING_EXPORT',
					message: `'${reexportDeclaration.localName}' is not exported by ${relativeId( reexportDeclaration.module.id )}`,
					url: `https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module`
				}, reexportDeclaration.start );
			}

			return declaration;
		}

		const exportDeclaration = this.exports[ name ];
		if ( exportDeclaration ) {
			const name = exportDeclaration.localName;
			const declaration = this.trace( name );

			return declaration || this.bundle.scope.findVariable( name );
		}

		if ( name === 'default' ) return;

		for ( let i = 0; i < this.exportAllModules.length; i += 1 ) {
			const module = this.exportAllModules[ i ];
			const declaration = module.traceExport( name );

			if ( declaration ) return declaration;
		}
	}

	warn ( warning, pos ) {
		if ( pos !== undefined ) {
			warning.pos = pos;

			const { line, column } = locate( this.code, pos, { offsetLine: 1 } ); // TODO trace sourcemaps

			warning.loc = { file: this.id, line, column };
			warning.frame = getCodeFrame( this.code, line, column );
		}

		warning.id = this.id;
		this.bundle.warn( warning );
	}
}
