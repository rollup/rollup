import { parse } from 'acorn/src/index';
import MagicString from 'magic-string';
import { walk } from 'estree-walker';
import Statement from './Statement';
import { blank, keys } from './utils/object';
import { basename, extname } from './utils/path';
import getLocation from './utils/getLocation';
import makeLegalIdentifier from './utils/makeLegalIdentifier';
import SOURCEMAPPING_URL from './utils/sourceMappingURL';

class SyntheticDefaultDeclaration {
	constructor ( node, statement, name ) {
		this.node = node;
		this.statement = statement;
		this.name = name;

		this.original = null;
		this.isExported = false;
		this.aliases = [];
	}

	addAlias ( declaration ) {
		this.aliases.push( declaration );
	}

	addReference ( reference ) {
		reference.declaration = this;
		this.name = reference.name;
	}

	bind ( declaration ) {
		this.original = declaration;
	}

	render () {
		return !this.original || this.original.isReassigned ?
			this.name :
			this.original.render();
	}

	use () {
		this.isUsed = true;
		this.statement.mark();

		if ( this.original ) this.original.use();

		this.aliases.forEach( alias => alias.use() );
	}
}

class SyntheticNamespaceDeclaration {
	constructor ( module ) {
		this.module = module;
		this.name = null;

		this.needsNamespaceBlock = false;
		this.aliases = [];

		this.originals = blank();
		module.getExports().forEach( name => {
			this.originals[ name ] = module.traceExport( name );
		});
	}

	addAlias ( declaration ) {
		this.aliases.push( declaration );
	}

	addReference ( reference ) {
		// if we have e.g. `foo.bar`, we can optimise
		// the reference by pointing directly to `bar`
		if ( reference.parts.length ) {
			reference.name = reference.parts.shift();

			reference.end += reference.name.length + 1; // TODO this is brittle

			const original = this.originals[ reference.name ];

			// throw with an informative error message if the reference doesn't exist.
			if ( !original ) {
				const err = new Error( `Export '${reference.name}' is not defined by '${this.module.id}'` );
				err.code = 'MISSING_EXPORT';
				err.file = this.module.id;
				throw err;
			}

			original.addReference( reference );
			return;
		}

		// otherwise we're accessing the namespace directly,
		// which means we need to mark all of this module's
		// exports and render a namespace block in the bundle
		if ( !this.needsNamespaceBlock ) {
			this.needsNamespaceBlock = true;
			this.module.bundle.internalNamespaces.push( this );
		}

		reference.declaration = this;
		this.name = reference.name;
	}

	renderBlock ( indentString ) {
		const members = keys( this.originals ).map( name => {
			const original = this.originals[ name ];

			if ( original.isReassigned ) {
				return `${indentString}get ${name} () { return ${original.render()}; }`;
			}

			return `${indentString}${name}: ${original.render()}`;
		});

		return `var ${this.render()} = Object.freeze({\n${members.join( ',\n' )}\n});\n\n`;
	}

	render () {
		return this.name;
	}

	use () {
		keys( this.originals ).forEach( name => {
			this.originals[ name ].use();
		});

		this.aliases.forEach( alias => alias.use() );
	}
}

export default class Module {
	constructor ({ id, code, originalCode, ast, sourceMapChain, bundle }) {
		this.code = code;
		this.originalCode = originalCode;
		this.sourceMapChain = sourceMapChain;

		this.bundle = bundle;
		this.id = id;

		// all dependencies
		this.dependencies = [];
		this.resolvedIds = blank();

		// imports and exports, indexed by local name
		this.imports = blank();
		this.exports = blank();
		this.reexports = blank();

		this.exportAllSources = [];
		this.exportAllModules = null;

		// By default, `id` is the filename. Custom resolvers and loaders
		// can change that, but it makes sense to use it for the source filename
		this.magicString = new MagicString( code, {
			filename: id,
			indentExclusionRanges: []
		});

		// remove existing sourceMappingURL comments
		const pattern = new RegExp( `\\/\\/#\\s+${SOURCEMAPPING_URL}=.+\\n?`, 'g' );
		let match;
		while ( match = pattern.exec( code ) ) {
			this.magicString.remove( match.index, match.index + match[0].length );
		}

		this.comments = [];
		this.statements = this.parse( ast );

		this.declarations = blank();
		this.analyse();
	}

	addExport ( statement ) {
		const node = statement.node;
		const source = node.source && node.source.value;

		// export { name } from './other'
		if ( source ) {
			if ( !~this.dependencies.indexOf( source ) ) this.dependencies.push( source );

			if ( node.type === 'ExportAllDeclaration' ) {
				// Store `export * from '...'` statements in an array of delegates.
				// When an unknown import is encountered, we see if one of them can satisfy it.
				this.exportAllSources.push( source );
			}

			else {
				node.specifiers.forEach( specifier => {
					this.reexports[ specifier.exported.name ] = {
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

			this.exports.default = {
				localName: 'default',
				identifier
			};

			// create a synthetic declaration
			this.declarations.default = new SyntheticDefaultDeclaration( node, statement, identifier || this.basename() );
		}

		// export { foo, bar, baz }
		// export var foo = 42;
		// export var a = 1, b = 2, c = 3;
		// export function foo () {}
		else if ( node.type === 'ExportNamedDeclaration' ) {
			if ( node.specifiers.length ) {
				// export { foo, bar, baz }
				node.specifiers.forEach( specifier => {
					const localName = specifier.local.name;
					const exportedName = specifier.exported.name;

					this.exports[ exportedName ] = { localName };
				});
			}

			else {
				let declaration = node.declaration;

				let name;

				if ( declaration.type === 'VariableDeclaration' ) {
					// export var foo = 42
					name = declaration.declarations[0].id.name;
				} else {
					// export function foo () {}
					name = declaration.id.name;
				}

				this.exports[ name ] = { localName: name };
			}
		}
	}

	addImport ( statement ) {
		const node = statement.node;
		const source = node.source.value;

		if ( !~this.dependencies.indexOf( source ) ) this.dependencies.push( source );

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
			this.imports[ localName ] = { source, name, module: null };
		});
	}

	analyse () {
		// discover this module's imports and exports
		this.statements.forEach( statement => {
			if ( statement.isImportDeclaration ) this.addImport( statement );
			else if ( statement.isExportDeclaration ) this.addExport( statement );

			statement.analyse();

			statement.scope.eachDeclaration( ( name, declaration ) => {
				this.declarations[ name ] = declaration;
			});
		});
	}

	basename () {
		const base = basename( this.id );
		const ext = extname( this.id );

		return makeLegalIdentifier( ext ? base.slice( 0, -ext.length ) : base );
	}

	bindAliases () {
		keys( this.declarations ).forEach( name => {
			if ( name === '*' ) return;

			const declaration = this.declarations[ name ];
			const statement = declaration.statement;

			if ( statement.node.type !== 'VariableDeclaration' ) return;

			statement.references.forEach( reference => {
				if ( reference.name === name || !reference.isImmediatelyUsed ) return;

				const otherDeclaration = this.trace( reference.name );
				if ( otherDeclaration ) otherDeclaration.addAlias( declaration );
			});
		});
	}

	bindImportSpecifiers () {
		[ this.imports, this.reexports ].forEach( specifiers => {
			keys( specifiers ).forEach( name => {
				const specifier = specifiers[ name ];

				const id = this.resolvedIds[ specifier.source ];
				specifier.module = this.bundle.moduleById[ id ];
			});
		});

		this.exportAllModules = this.exportAllSources.map( source => {
			const id = this.resolvedIds[ source ];
			return this.bundle.moduleById[ id ];
		});
	}

	bindReferences () {
		if ( this.declarations.default ) {
			if ( this.exports.default.identifier ) {
				const declaration = this.trace( this.exports.default.identifier );
				if ( declaration ) this.declarations.default.bind( declaration );
			}
		}

		this.statements.forEach( statement => {
			// skip `export { foo, bar, baz }`...
			if ( statement.node.type === 'ExportNamedDeclaration' && statement.node.specifiers.length ) {
				// ...unless this is the entry module
				if ( this !== this.bundle.entryModule ) return;
			}

			statement.references.forEach( reference => {
				const declaration = reference.scope.findDeclaration( reference.name ) ||
				                    this.trace( reference.name );

				if ( declaration ) {
					declaration.addReference( reference );
				} else {
					// TODO handle globals
					this.bundle.assumedGlobals[ reference.name ] = true;
				}
			});
		});
	}

	consolidateDependencies () {
		let strongDependencies = blank();
		let weakDependencies = blank();

		// treat all imports as weak dependencies
		this.dependencies.forEach( source => {
			const id = this.resolvedIds[ source ];
			const dependency = this.bundle.moduleById[ id ];

			if ( !dependency.isExternal ) {
				weakDependencies[ dependency.id ] = dependency;
			}
		});

		// identify strong dependencies to break ties in case of cycles
		this.statements.forEach( statement => {
			statement.references.forEach( reference => {
				const declaration = reference.declaration;

				if ( declaration && declaration.statement ) {
					const module = declaration.statement.module;
					if ( module === this ) return;

					// TODO disregard function declarations
					if ( reference.isImmediatelyUsed ) {
						strongDependencies[ module.id ] = module;
					}
				}
			});
		});

		return { strongDependencies, weakDependencies };
	}

	getExports () {
		let exports = blank();

		keys( this.exports ).forEach( name => {
			exports[ name ] = true;
		});

		keys( this.reexports ).forEach( name => {
			exports[ name ] = true;
		});

		this.exportAllModules.forEach( module => {
			module.getExports().forEach( name => {
				if ( name !== 'default' ) exports[ name ] = true;
			});
		});

		return keys( exports );
	}

	markAllSideEffects () {
		let hasSideEffect = false;

		this.statements.forEach( statement => {
			if ( statement.markSideEffect() ) hasSideEffect = true;
		});

		return hasSideEffect;
	}

	namespace () {
		if ( !this.declarations['*'] ) {
			this.declarations['*'] = new SyntheticNamespaceDeclaration( this );
		}

		return this.declarations['*'];
	}

	parse ( ast ) {
		// The ast can be supplied programmatically (but usually won't be)
		if ( !ast ) {
			// Try to extract a list of top-level statements/declarations. If
			// the parse fails, attach file info and abort
			try {
				ast = parse( this.code, {
					ecmaVersion: 6,
					sourceType: 'module',
					onComment: ( block, text, start, end ) => this.comments.push({ block, text, start, end }),
					preserveParens: true
				});
			} catch ( err ) {
				err.code = 'PARSE_ERROR';
				err.file = this.id; // see above - not necessarily true, but true enough
				err.message += ` in ${this.id}`;
				throw err;
			}
		}

		walk( ast, {
			enter: node => {
				this.magicString.addSourcemapLocation( node.start );
				this.magicString.addSourcemapLocation( node.end );
			}
		});

		let statements = [];
		let lastChar = 0;
		let commentIndex = 0;

		ast.body.forEach( node => {
			if ( node.type === 'EmptyStatement' ) return;

			if (
				node.type === 'ExportNamedDeclaration' &&
				node.declaration &&
				node.declaration.type === 'VariableDeclaration' &&
				node.declaration.declarations &&
				node.declaration.declarations.length > 1
			) {
				// push a synthetic export declaration
				const syntheticNode = {
					type: 'ExportNamedDeclaration',
					specifiers: node.declaration.declarations.map( declarator => {
						const id = { name: declarator.id.name };
						return {
							local: id,
							exported: id
						};
					}),
					isSynthetic: true
				};

				const statement = new Statement( syntheticNode, this, node.start, node.start );
				statements.push( statement );

				this.magicString.remove( node.start, node.declaration.start );
				node = node.declaration;
			}

			// special case - top-level var declarations with multiple declarators
			// should be split up. Otherwise, we may end up including code we
			// don't need, just because an unwanted declarator is included
			if ( node.type === 'VariableDeclaration' && node.declarations.length > 1 ) {
				// remove the leading var/let/const... UNLESS the previous node
				// was also a synthetic node, in which case it'll get removed anyway
				const lastStatement = statements[ statements.length - 1 ];
				if ( !lastStatement || !lastStatement.node.isSynthetic ) {
					this.magicString.remove( node.start, node.declarations[0].start );
				}

				node.declarations.forEach( declarator => {
					const { start, end } = declarator;

					const syntheticNode = {
						type: 'VariableDeclaration',
						kind: node.kind,
						start,
						end,
						declarations: [ declarator ],
						isSynthetic: true
					};

					const statement = new Statement( syntheticNode, this, start, end );
					statements.push( statement );
				});

				lastChar = node.end; // TODO account for trailing line comment
			}

			else {
				let comment;
				do {
					comment = this.comments[ commentIndex ];
					if ( !comment ) break;
					if ( comment.start > node.start ) break;
					commentIndex += 1;
				} while ( comment.end < lastChar );

				const start = comment ? Math.min( comment.start, node.start ) : node.start;
				const end = node.end; // TODO account for trailing line comment

				const statement = new Statement( node, this, start, end );
				statements.push( statement );

				lastChar = end;
			}
		});

		let i = statements.length;
		let next = this.code.length;
		while ( i-- ) {
			statements[i].next = next;
			if ( !statements[i].isSynthetic ) next = statements[i].start;
		}

		return statements;
	}

	render ( es6 ) {
		let magicString = this.magicString.clone();

		this.statements.forEach( statement => {
			if ( !statement.isIncluded ) {
				magicString.remove( statement.start, statement.next );
				return;
			}

			statement.stringLiteralRanges.forEach( range => magicString.indentExclusionRanges.push( range ) );

			// skip `export { foo, bar, baz }`
			if ( statement.node.type === 'ExportNamedDeclaration' ) {
				if ( statement.node.isSynthetic ) return;

				// skip `export { foo, bar, baz }`
				if ( statement.node.specifiers.length ) {
					magicString.remove( statement.start, statement.next );
					return;
				}
			}

			// split up/remove var declarations as necessary
			if ( statement.node.isSynthetic ) {
				// insert `var/let/const` if necessary
				const declaration = this.declarations[ statement.node.declarations[0].id.name ];
				if ( !( declaration.isExported && declaration.isReassigned ) ) { // TODO encapsulate this
					magicString.insert( statement.start, `${statement.node.kind} ` );
				}

				magicString.overwrite( statement.end, statement.next, ';\n' ); // TODO account for trailing newlines
			}

			let toDeshadow = blank();

			statement.references.forEach( reference => {
				const declaration = reference.declaration;

				if ( declaration ) {
					const { start, end } = reference;
					const name = declaration.render( es6 );

					// the second part of this check is necessary because of
					// namespace optimisation – name of `foo.bar` could be `bar`
					if ( reference.name === name && name.length === reference.end - reference.start ) return;

					reference.rewritten = true;

					// prevent local variables from shadowing renamed references
					const identifier = name.match( /[^\.]+/ )[0];
					if ( reference.scope.contains( identifier ) ) {
						toDeshadow[ identifier ] = `${identifier}$$`; // TODO more robust mechanism
					}

					if ( reference.isShorthandProperty ) {
						magicString.insert( end, `: ${name}` );
					} else {
						magicString.overwrite( start, end, name, true );
					}
				}
			});

			if ( keys( toDeshadow ).length ) {
				statement.references.forEach( reference => {
					if ( !reference.rewritten && reference.name in toDeshadow ) {
						magicString.overwrite( reference.start, reference.end, toDeshadow[ reference.name ], true );
					}
				});
			}

			// modify exports as necessary
			if ( statement.isExportDeclaration ) {
				// remove `export` from `export var foo = 42`
				if ( statement.node.type === 'ExportNamedDeclaration' && statement.node.declaration.type === 'VariableDeclaration' ) {
					const name = statement.node.declaration.declarations[0].id.name;
					const declaration = this.declarations[ name ];

					const end = declaration.isExported && declaration.isReassigned ?
						statement.node.declaration.declarations[0].start :
						statement.node.declaration.start;

					magicString.remove( statement.node.start, end );
				}

				else if ( statement.node.type === 'ExportAllDeclaration' ) {
					// TODO: remove once `export * from 'external'` is supported.
					magicString.remove( statement.start, statement.next );
				}

				// remove `export` from `export class Foo {...}` or `export default Foo`
				// TODO default exports need different treatment
				else if ( statement.node.declaration.id ) {
					magicString.remove( statement.node.start, statement.node.declaration.start );
				}

				else if ( statement.node.type === 'ExportDefaultDeclaration' ) {
					const defaultDeclaration = this.declarations.default;

					// prevent `var foo = foo`
					if ( defaultDeclaration.original && !defaultDeclaration.original.isReassigned ) {
						magicString.remove( statement.start, statement.next );
						return;
					}

					const defaultName = defaultDeclaration.render();

					// prevent `var undefined = sideEffectyDefault(foo)`
					if ( !defaultDeclaration.isExported && !defaultDeclaration.isUsed ) {
						magicString.remove( statement.start, statement.node.declaration.start );
						return;
					}

					// anonymous functions should be converted into declarations
					if ( statement.node.declaration.type === 'FunctionExpression' ) {
						magicString.overwrite( statement.node.start, statement.node.declaration.start + 8, `function ${defaultName}` );
					} else {
						magicString.overwrite( statement.node.start, statement.node.declaration.start, `var ${defaultName} = ` );
					}
				}

				else {
					throw new Error( 'Unhandled export' );
				}
			}
		});

		// add namespace block if necessary
		const namespace = this.declarations['*'];
		if ( namespace && namespace.needsNamespaceBlock ) {
			magicString.append( '\n\n' + namespace.renderBlock( magicString.getIndentString() ) );
		}

		return magicString.trim();
	}

	trace ( name ) {
		if ( name in this.declarations ) return this.declarations[ name ];
		if ( name in this.imports ) {
			const importDeclaration = this.imports[ name ];
			const otherModule = importDeclaration.module;

			if ( importDeclaration.name === '*' && !otherModule.isExternal ) {
				return otherModule.namespace();
			}

			return otherModule.traceExport( importDeclaration.name, this );
		}

		return null;
	}

	traceExport ( name, importer ) {
		// export { foo } from './other'
		const reexportDeclaration = this.reexports[ name ];
		if ( reexportDeclaration ) {
			return reexportDeclaration.module.traceExport( reexportDeclaration.localName, this );
		}

		const exportDeclaration = this.exports[ name ];
		if ( exportDeclaration ) {
			return this.trace( exportDeclaration.localName );
		}

		for ( let i = 0; i < this.exportAllModules.length; i += 1 ) {
			const module = this.exportAllModules[i];
			const declaration = module.traceExport( name, this );

			if ( declaration ) return declaration;
		}

		let errorMessage = `Module ${this.id} does not export ${name}`;
		if ( importer ) errorMessage += ` (imported by ${importer.id})`;

		throw new Error( errorMessage );
	}
}
