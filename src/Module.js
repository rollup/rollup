import { basename, extname } from './utils/path';
import { parse } from 'acorn';
import MagicString from 'magic-string';
import Statement from './Statement';
import walk from './ast/walk';
import { blank, keys } from './utils/object';
import getLocation from './utils/getLocation';
import makeLegalIdentifier from './utils/makeLegalIdentifier';

function isEmptyExportedVarDeclaration ( node, exports, toExport ) {
	if ( node.type !== 'VariableDeclaration' || node.declarations[0].init ) return false;

	const name = node.declarations[0].id.name;

	const id = exports.lookup( name );

	return !~toExport.indexOf( id.name );
}

function removeSourceMappingURLComments ( source, magicString ) {
	const pattern = /\/\/#\s+sourceMappingURL=.+\n?/g;
	let match;
	while ( match = pattern.exec( source ) ) {
		magicString.remove( match.index, match.index + match[0].length );
	}
}

export default class Module {
	constructor ({ id, source, ast, bundle }) {
		this.source = source;

		this.bundle = bundle;
		this.id = id;

		// Implement Identifier interface.
		this.name = makeLegalIdentifier( basename( id ).slice( 0, -extname( id ).length ) );

		// By default, `id` is the filename. Custom resolvers and loaders
		// can change that, but it makes sense to use it for the source filename
		this.magicString = new MagicString( source, {
			filename: id
		});

		removeSourceMappingURLComments( source, this.magicString );

		this.comments = [];

		this.statements = this.parse( ast );

		// all dependencies
		this.resolvedIds = blank();

		// Virtual scopes for the local and exported names.
		this.locals = bundle.scope.virtual();
		this.exports = bundle.scope.virtual();

		this.exportAlls = [];

		this.reassignments = [];

		this.marked = blank();
		this.definitions = blank();
		this.definitionPromises = blank();
		this.modifications = blank();

		this.dependencies = this.collectDependencies();
	}

	addExport ( statement ) {
		const node = statement.node;
		const source = node.source && node.source.value;

		// export { name } from './other'
		if ( source ) {
			const module = this.getModule( source );

			if ( node.type === 'ExportAllDeclaration' ) {
				// Store `export * from '...'` statements in an array of delegates.
				// When an unknown import is encountered, we see if one of them can satisfy it.
				this.exportAlls.push( module );
			}

			else {
				node.specifiers.forEach( specifier => {
					// Bind the export of this module, to the export of the other.
					this.exports.bind( specifier.exported.name,
						module.exports.reference( specifier.local.name ) );
				});
			}
		}

		// export default function foo () {}
		// export default foo;
		// export default 42;
		else if ( node.type === 'ExportDefaultDeclaration' ) {
			const isDeclaration = /Declaration$/.test( node.declaration.type );
			const isAnonymous = /(?:Class|Function)Expression$/.test( node.declaration.type );

			const identifier = isDeclaration ?
				node.declaration.id.name :
				node.declaration.type === 'Identifier' ?
					node.declaration.name :
					null;

			if ( identifier ) {
				// If the default export has an identifier, bind to it.
				this.exports.bind( 'default', this.locals.reference( identifier ) );
			} else {
				this.exports.define( this.name, {
					originalName: 'default',
					name: 'default',

					module: this,
					statement,
					localName: 'default',
					identifier,
					isDeclaration,
					isAnonymous,
					isModified: false // in case of `export default foo; foo = somethingElse`
				});
			}

		}

		// export { foo, bar, baz }
		// export var foo = 42;
		// export function foo () {}
		else if ( node.type === 'ExportNamedDeclaration' ) {
			if ( node.specifiers.length ) {
				// export { foo, bar, baz }
				node.specifiers.forEach( specifier => {
					const localName = specifier.local.name;
					const exportedName = specifier.exported.name;

					this.exports.bind( exportedName, this.locals.reference( localName ) );
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

				this.locals.define({
					originalName: name,
					name,

					module: this,
					statement,
					localName: name,
					expression: declaration
				});

				this.exports.bind( name, this.locals.reference( name ) );
			}
		}
	}

	addImport ( statement ) {
		const node = statement.node;
		const module = this.getModule( node.source.value );

		node.specifiers.forEach( specifier => {
			const isDefault = specifier.type === 'ImportDefaultSpecifier';
			const isNamespace = specifier.type === 'ImportNamespaceSpecifier';

			const name = isDefault ? 'default' : specifier.imported.name;
			const localName = specifier.local.name;

			if ( this.locals.defines( localName ) ) {
				const err = new Error( `Duplicated import '${localName}'` );
				err.file = this.id;
				err.loc = getLocation( this.source, specifier.start );
				throw err;
			}

			if ( isNamespace ) {
				// If it's a namespace import, we bind the localName to the module itself.
				this.locals.bind( localName, module );
			} else {
				this.locals.bind( localName, module.exports.reference( name ) );

				// For compliance with earlier Rollup versions.
				// If the module is external, and we access the default.
				// Rewrite the module name, and the default name to the
				// `localName` we use for it.
				if ( module.isExternal && isDefault ) {
					const id = module.exports.lookup( name );
					module.name = id.name = localName;
				}
			}
		});
	}

	analyse () {
		// discover this module's imports and exports
		this.statements.forEach( statement => {
			if ( statement.isImportDeclaration ) this.addImport( statement );
			else if ( statement.isExportDeclaration ) this.addExport( statement );

			statement.analyse();

			// consolidate names that are defined/modified in this module
			keys( statement.defines ).forEach( name => {
				this.locals.define( name, {
					originalName: name,
					name,

					statement,
					module: this
				});

				// FIXME: remove?
				this.definitions[ name ] = statement;
			});

			keys( statement.modifies ).forEach( name => {
				( this.modifications[ name ] || ( this.modifications[ name ] = [] ) ).push( statement );
			});
		});

		// discover variables that are reassigned inside function
		// bodies, so we can keep bindings live, e.g.
		//
		//   export var count = 0;
		//   export function incr () { count += 1 }
		let reassigned = blank();
		this.statements.forEach( statement => {
			keys( statement.reassigns ).forEach( name => {
				reassigned[ name ] = true;
			});
		});

		// if names are referenced that are neither defined nor imported
		// in this module, we assume that they're globals
		this.statements.forEach( statement => {
			if ( statement.isReexportDeclaration ) return;

			// while we're here, mark reassignments
			statement.scope.varDeclarations.forEach( name => {
				if ( reassigned[ name ] && !~this.reassignments.indexOf( name ) ) {
					this.reassignments.push( name );
				}
			});

			keys( statement.dependsOn ).forEach( name => {
				if ( !this.locals.inScope( name ) ) {
					this.bundle.globals.define( name );
				}
			});
		});
	}

	// Returns the set of imported module ids by going through all import/exports statements.
	collectDependencies () {
		const importedModules = blank();

		this.statements.forEach( statement => {
			if ( statement.isImportDeclaration || ( statement.isExportDeclaration && statement.node.source ) ) {
				importedModules[ statement.node.source.value ] = true;
			}
		});

		return keys( importedModules );
	}

	consolidateDependencies () {
		let strongDependencies = blank();

		function addDependency ( dependencies, declaration ) {
			if ( declaration && declaration.module && !declaration.module.isExternal ) {
				dependencies[ declaration.module.id ] = declaration.module;
				return true;
			}
		}

		this.statements.forEach( statement => {
			if ( statement.isImportDeclaration && !statement.node.specifiers.length ) {
				// include module for its side-effects
				const module = this.getModule( statement.node.source.value );

				if ( !module.isExternal ) strongDependencies[ module.id ] = module;
			}

			else if ( statement.isReexportDeclaration ) {
				if ( statement.node.specifiers ) {
					statement.node.specifiers.forEach( specifier => {
						let name = specifier.exported.name;

						let id = this.locals.lookup( name );

						addDependency( strongDependencies, id );
					});
				}
			}

			else {
				keys( statement.stronglyDependsOn ).forEach( name => {
					if ( statement.defines[ name ] ) return;

					addDependency( strongDependencies, this.locals.lookup( name ) );
				});
			}
		});

		let weakDependencies = blank();

		this.statements.forEach( statement => {
			keys( statement.dependsOn ).forEach( name => {
				if ( statement.defines[ name ] ) return;

				addDependency( weakDependencies, this.locals.lookup( name ) );
			});
		});

		return { strongDependencies, weakDependencies };
	}

	defaultName () {
		return this.name;
	}

	findDefiningStatement ( name ) {
		if ( this.definitions[ name ] ) return this.definitions[ name ];

		return null;
	}

	getModule ( source ) {
		return this.bundle.moduleById[ this.resolvedIds[ source ] ];
	}

	mark ( name ) {
		const id = this.locals.lookup( name );

		if ( id && id.statement ) {
			// Assert that statement is defined. It isn't for external modules.
			id.statement.mark();
		}
	}

	markAllStatements ( isEntryModule ) {
		this.statements.forEach( statement => {
			if ( statement.isIncluded ) return; // TODO can this happen? probably not...

			// skip import declarations...
			if ( statement.isImportDeclaration ) {
				// ...unless they're empty, in which case assume we're importing them for the side-effects
				// THIS IS NOT FOOLPROOF. Probably need /*rollup: include */ or similar
				if ( !statement.node.specifiers.length ) {
					const otherModule = this.getModule( statement.node.source.value );

					if ( !otherModule.isExternal ) otherModule.markAllStatements();
				}
			}

			// skip `export { foo, bar, baz }`...
			else if ( statement.node.type === 'ExportNamedDeclaration' && statement.node.specifiers.length ) {
				// ...but ensure they are defined, if this is the entry module
				if ( isEntryModule ) statement.mark();
			}

			// include everything else
			else {
				statement.mark();
			}
		});
	}

	markAllExportStatements () {
		this.statements.forEach( statement => {
			if ( statement.isExportDeclaration ) statement.mark();
		});
	}

	markExport ( name, suggestedName, importer ) {
		const id = this.exports.lookup( name );

		if ( id ) {
			// Assert that statement is defined. It isn't for external modules.
			if ( id.statement ) id.statement.mark();

			return;
		}

		for ( const module of this.exportAlls ) {
			const id = module.exports.lookup( name );

			if ( id ) {
				// Assert that statement is defined. It isn't for external modules.
				if ( id.statement ) id.statement.mark();

				return;
			}
		}

		throw new Error( `Module ${this.id} does not export ${name} (imported by ${importer.id})` );
	}

	parse ( ast ) {
		// The ast can be supplied programmatically (but usually won't be)
		if ( !ast ) {
			// Try to extract a list of top-level statements/declarations. If
			// the parse fails, attach file info and abort
			try {
				ast = parse( this.source, {
					ecmaVersion: 6,
					sourceType: 'module',
					onComment: ( block, text, start, end ) => this.comments.push({ block, text, start, end })
				});
			} catch ( err ) {
				err.code = 'PARSE_ERROR';
				err.file = this.id; // see above - not necessarily true, but true enough
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
			// special case - top-level var declarations with multiple declarators
			// should be split up. Otherwise, we may end up including code we
			// don't need, just because an unwanted declarator is included
			if ( node.type === 'VariableDeclaration' && node.declarations.length > 1 ) {
				// remove the leading var/let/const
				this.magicString.remove( node.start, node.declarations[0].start );

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

		statements.forEach( ( statement, i ) => {
			const nextStatement = statements[ i + 1 ];
			statement.next = nextStatement ? nextStatement.start : statement.end;
		});

		return statements;
	}

	render ( toExport ) {
		let magicString = this.magicString.clone();

		this.statements.forEach( statement => {
			if ( !statement.isIncluded ) {
				magicString.remove( statement.start, statement.next );
				return;
			}

			// skip `export { foo, bar, baz }`
			if ( statement.node.type === 'ExportNamedDeclaration' ) {
				// skip `export { foo, bar, baz }`
				if ( statement.node.specifiers.length ) {
					magicString.remove( statement.start, statement.next );
					return;
				}

				// skip `export var foo;` if foo is exported
				if ( isEmptyExportedVarDeclaration( statement.node.declaration, this.exports, toExport ) ) {
					magicString.remove( statement.start, statement.next );
					return;
				}
			}

			// skip empty var declarations for exported bindings
			// (otherwise we're left with `exports.foo;`, which is useless)
			if ( isEmptyExportedVarDeclaration( statement.node, this.exports, toExport ) ) {
				magicString.remove( statement.start, statement.next );
				return;
			}

			// split up/remove var declarations as necessary
			if ( statement.node.isSynthetic ) {
				// insert `var/let/const` if necessary
				// FIXME: !!
				// if ( !allBundleExports[ statement.node.declarations[0].id.name ] ) {
				// 	magicString.insert( statement.start, `${statement.node.kind} ` );
				// }

				magicString.overwrite( statement.end, statement.next, ';\n' ); // TODO account for trailing newlines
			}

			let replacements = blank();
			let bundleExports = blank();

			keys( statement.dependsOn )
				.concat( keys( statement.defines ) )
				.forEach( name => {
					const bundleName = this.locals.lookup( name ).name;

					if ( toExport[ bundleName ] ) {
						bundleExports[ name ] = replacements[ name ] = toExport[ bundleName ];
					} else if ( bundleName !== name ) { // TODO weird structure
						replacements[ name ] = bundleName;
					}
				});

			statement.replaceIdentifiers( magicString, replacements, bundleExports );

			// modify exports as necessary
			if ( statement.isExportDeclaration ) {
				// remove `export` from `export var foo = 42`
				if ( statement.node.type === 'ExportNamedDeclaration' && statement.node.declaration.type === 'VariableDeclaration' ) {
					magicString.remove( statement.node.start, statement.node.declaration.start );
				}

				// remove `export` from `export class Foo {...}` or `export default Foo`
				// TODO default exports need different treatment
				else if ( statement.node.declaration.id ) {
					magicString.remove( statement.node.start, statement.node.declaration.start );
				}

				else if ( statement.node.type === 'ExportDefaultDeclaration' ) {
					const canonicalName = this.defaultName();

					// FIXME: dunno what to do here yet.
					// if ( statement.node.declaration.type === 'Identifier' && canonicalName === ( moduleReplacements[ statement.node.declaration.name ] || statement.node.declaration.name ) ) {
					// 	magicString.remove( statement.start, statement.next );
					// 	return;
					// }

					// prevent `var undefined = sideEffectyDefault(foo)`
					if ( canonicalName === undefined ) {
						magicString.remove( statement.start, statement.node.declaration.start );
						return;
					}

					// anonymous functions should be converted into declarations
					if ( statement.node.declaration.type === 'FunctionExpression' ) {
						magicString.overwrite( statement.node.start, statement.node.declaration.start + 8, `function ${canonicalName}` );
					} else {
						magicString.overwrite( statement.node.start, statement.node.declaration.start, `var ${canonicalName} = ` );
					}
				}

				else {
					throw new Error( 'Unhandled export' );
				}
			}
		});

		return magicString.trim();
	}
}
