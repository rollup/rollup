import { basename, extname } from './utils/path';
import { parse } from 'acorn';
import MagicString from 'magic-string';
import Statement from './Statement';
import walk from './ast/walk';
import { blank, keys } from './utils/object';
import getLocation from './utils/getLocation';
import makeLegalIdentifier from './utils/makeLegalIdentifier';
import SOURCEMAPPING_URL from './utils/sourceMappingUrl';

function isEmptyExportedVarDeclaration ( node, exports, toExport ) {
	if ( node.type !== 'VariableDeclaration' || node.declarations[0].init ) return false;

	const name = node.declarations[0].id.name;

	const id = exports.lookup( name );

	return id && id.name in toExport;
}

function removeSourceMappingURLComments ( source, magicString ) {
	const SOURCEMAPPING_URL_PATTERN = new RegExp( `\\/\\/#\\s+${SOURCEMAPPING_URL}=.+\\n?`, 'g' );
	let match;

	while ( match = SOURCEMAPPING_URL_PATTERN.exec( source ) ) {
		magicString.remove( match.index, match.index + match[0].length );
	}
}

function assign ( target, source ) {
	for ( let key in source ) target[ key ] = source[ key ];
}

class Id {
	constructor ( module, name, statement ) {
		this.originalName = this.name = name;
		this.module = module;
		this.statement = statement;

		this.modifierStatements = [];

		// modifiers
		this.isUsed = false;
	}

	mark () {
		this.isUsed = true;
		this.statement.mark();
		this.modifierStatements.forEach( stmt => stmt.mark() );
	}
}

export default class Module {
	constructor ({ id, source, ast, bundle }) {
		this.source = source;

		this.bundle = bundle;
		this.id = id;
		this.module = this;
		this.isModule = true;

		// Implement Identifier interface.
		this.name = makeLegalIdentifier( basename( id ).slice( 0, -extname( id ).length ) );

		// HACK: If `id` isn't a path, the above code yields the empty string.
		if ( !this.name ) {
			this.name = makeLegalIdentifier( id );
		}

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
		this.locals = bundle.scope.virtual( true );
		this.exports = bundle.scope.virtual( false );

		const { reference, inScope } = this.exports;

		this.exports.reference = name => {
			// If we have it, grab it.
			if ( inScope.call( this.exports, name ) ) {
				return reference.call( this.exports, name );
			}

			// ... otherwise search allExportsFrom
			for ( let i = 0; i < this.allExportsFrom.length; i += 1 ) {
				const module = this.allExportsFrom[i];
				if ( module.exports.inScope( name ) ) {
					return module.exports.reference( name );
				}
			}

			// throw new Error( `The name "${name}" is never exported (from ${this.id})!` );
			return reference.call( this.exports, name );
		};

		this.exports.inScope = name => {
			if ( inScope.call( this.exports, name ) ) return true;

			return this.allExportsFrom.some( module => module.exports.inScope( name ) );
		};

		// Create a unique virtual scope for references to the module.
		// const unique = bundle.scope.virtual();
		// unique.define( this.name, this );
		// this.reference = unique.reference( this.name );

		// As far as we know, all our exported bindings have been resolved.
		this.allExportsResolved = true;
		this.allExportsFrom = [];

		this.reassignments = [];

		// TODO: change to false, and detect when it's necessary.
		this.needsDynamicAccess = false;

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

				if ( module.isExternal ) {
					let err = new Error( `Cannot trace 'export *' references through external modules.` );
					err.file = this.id;
					err.loc = getLocation( this.source, node.start );
					throw err;
				}

				// It seems like we must re-export all exports from another module...
				this.allExportsResolved = false;

				if ( !~this.allExportsFrom.indexOf( module ) ) {
					this.allExportsFrom.push( module );
				}
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
			const name = identifier || this.name;

			// Always define a new `Identifier` for the default export.
			const id = new Id( this, name, statement );

			// Keep the identifier name, if one exists.
			// We can optimize the newly created default `Identifier` away,
			// if it is never modified.
			// in case of `export default foo; foo = somethingElse`
			assign( id, { isDeclaration, isAnonymous, identifier } );

			this.exports.define( 'default', id );
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

				this.locals.define( name, new Id( this, name, statement ) );
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

			const localName = specifier.local.name;

			if ( this.locals.defines( localName ) ) {
				const err = new Error( `Duplicated import '${localName}'` );
				err.file = this.id;
				err.loc = getLocation( this.source, specifier.start );
				throw err;
			}

			if ( isNamespace ) {
				// If it's a namespace import, we bind the localName to the module itself.
				module.needsAll = true;
				module.name = localName;
				this.locals.bind( localName, module );
			} else {
				const name = isDefault ? 'default' : specifier.imported.name;

				this.locals.bind( localName, module.exports.reference( name ) );

				// For compliance with earlier Rollup versions.
				// If the module is external, and we access the default.
				// Rewrite the module name, and the default name to the
				// `localName` we use for it.
				if ( module.isExternal && isDefault ) {
					const id = module.exports.lookup( name );
					module.name = id.name = localName;
					id.name += '__default';
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
				this.locals.define( name, new Id( this, name, statement ) );
			});
		});

		// If all exports aren't resolved, but all our delegate modules are...
		if ( !this.allExportsResolved && this.allExportsFrom.every( module => module.allExportsResolved )) {
			// .. then all our exports should be as well.
			this.allExportsResolved = true;

			// For all modules we export all from, iterate through its exported names.
			// If we don't already define the binding 'name',
			// bind the name to the other module's reference.
			this.allExportsFrom.forEach( module => {
				module.exports.getNames().forEach( name => {
					if ( !this.exports.defines( name ) ) {
						this.exports.bind( name, module.exports.reference( name ) );
					}
				});
			});
		}

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
				// For each name we depend on that isn't in scope,
				// add a new global and bind the local name to it.
				if ( !this.locals.inScope( name ) ) {
					this.bundle.globals.define( name, {
						originalName: name,
						name,
						mark () {}
					});
					this.locals.bind( name, this.bundle.globals.reference( name ) );
				}
			});
		});

		// OPTIMIZATION!
		// If we have a default export and it's value is never modified,
		// bind to it directly.
		const def = this.exports.lookup( 'default' );
		if ( def && !def.isModified && def.identifier ) {
			this.exports.bind( 'default', this.locals.reference( def.identifier ) );
		}
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

						let id = this.exports.lookup( name );

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

		// Go through all our local and exported ids and make us depend on
		// the defining modules as well as
		this.exports.getIds().concat(this.locals.getIds()).forEach( id => {
			if ( id.module && !id.module.isExternal ) {
				weakDependencies[ id.module.id ] = id.module;
			}

			if ( !id.modifierStatements ) return;

			id.modifierStatements.forEach( statement => {
				const module = statement.module;
				weakDependencies[ module.id ] = module;
			});
		});

		// `Bundle.sort` gets stuck in an infinite loop if a module has
		// `strongDependencies` to itself. Make sure it doesn't happen.
		delete strongDependencies[ this.id ];
		delete weakDependencies[ this.id ];

		return { strongDependencies, weakDependencies };
	}

	getModule ( source ) {
		return this.bundle.moduleById[ this.resolvedIds[ source ] ];
	}

	// If a module is marked, enforce dynamic access of its properties.
	mark () {
		if ( this.needsDynamicAccess ) return;
		this.needsDynamicAccess = true;

		this.markAllExports();
	}

	markAllSideEffects () {
		this.statements.forEach( statement => {
			statement.markSideEffect();
		});
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
				// Be sure to mark the default export for the entry module.
				if ( isEntryModule && statement.node.type === 'ExportDefaultDeclaration' ) {
					this.exports.lookup( 'default' ).mark();
				}

				statement.mark();
			}
		});
	}

	// Marks all exported identifiers.
	markAllExports () {
		this.exports.getIds().forEach( id => id.mark() );
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

		statements.forEach( ( statement, i ) => {
			const nextStatement = statements[ i + 1 ];
			statement.next = nextStatement ? nextStatement.start : statement.end;
		});

		return statements;
	}

	render ( toExport, direct ) {
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
				if ( !toExport[ statement.node.declarations[0].id.name ] ) {
					magicString.insert( statement.start, `${statement.node.kind} ` );
				}

				magicString.overwrite( statement.end, statement.next, ';\n' ); // TODO account for trailing newlines
			}

			let replacements = blank();
			let bundleExports = blank();

			// Indirect identifier access.
			if ( !direct ) {
				keys( statement.dependsOn )
					.forEach( name => {
						const id = this.locals.lookup( name );

						// We shouldn't create a replacement for `id` if
						//   1. `id` is a Global, in which case it has no module property
						//   2. `id.module` isn't external, which means we have direct access
						//   3. `id` is its own module, in the case of namespace imports
						if ( id.module && id.module.isExternal && id.module !== id ) {
							replacements[ name ] = id.originalName === 'default' ?
								// default names are always directly accessed
								id.name :
								// other names are indirectly accessed
								`${id.module.name}.${id.originalName}`;
						}
					});
			}

			keys( statement.dependsOn )
				.concat( keys( statement.defines ) )
				.forEach( name => {
					const bundleName = this.locals.lookup( name ).name;

					if ( toExport[ bundleName ] ) {
						bundleExports[ name ] = replacements[ name ] = toExport[ bundleName ];
					} else if ( bundleName !== name && !replacements[ name ] ) { // TODO weird structure
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
					const def = this.exports.lookup( 'default' );

					// FIXME: dunno what to do here yet.
					if ( statement.node.declaration.type === 'Identifier' && def.name === ( replacements[ statement.node.declaration.name ] || statement.node.declaration.name ) ) {
						magicString.remove( statement.start, statement.next );
						return;
					}

					// prevent `var undefined = sideEffectyDefault(foo)`
					if ( !def.isUsed ) {
						magicString.remove( statement.start, statement.node.declaration.start );
						return;
					}

					// anonymous functions should be converted into declarations
					if ( statement.node.declaration.type === 'FunctionExpression' ) {
						magicString.overwrite( statement.node.start, statement.node.declaration.start + 8, `function ${def.name}` );
					} else {
						magicString.overwrite( statement.node.start, statement.node.declaration.start, `var ${def.name} = ` );
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
