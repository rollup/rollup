// import { dirname } from './utils/path';
import { Promise } from 'sander';
import { parse } from 'acorn';
import MagicString from 'magic-string';
import Statement from './Statement';
import walk from './ast/walk';
import { blank, keys } from './utils/object';
import { first, sequence } from './utils/promise';
import getLocation from './utils/getLocation';
import inferModuleName from './utils/inferModuleName';
// import makeLegalIdentifier from './utils/makeLegalIdentifier';

const emptyArrayPromise = Promise.resolve([]);


function isEmptyExportedVarDeclaration ( node, module, allBundleExports, direct ) {
	if ( node.type !== 'VariableDeclaration' || node.declarations[0].init ) return false;

	const name = node.declarations[0].id.name;
	const canonicalName = module.getCanonicalName( name, direct );

	return canonicalName in allBundleExports;
}

export default class Module {
	constructor ({ id, source, ast, bundle, scope, entry }) {
		this.source = source;

		this.bundle = bundle;
		this.id = id;
		this.scope = scope;

		this.isEntryModule = entry;

		// By default, `id` is the filename. Custom resolvers and loaders
		// can change that, but it makes sense to use it for the source filename
		this.magicString = new MagicString( source, {
			filename: id
		});

		// this.suggestedNames = blank();

		// remove existing sourceMappingURL comments
		const pattern = /\/\/#\s+sourceMappingURL=.+\n?/g;
		let match;
		while ( match = pattern.exec( source ) ) {
			this.magicString.remove( match.index, match.index + match[0].length );
		}

		this.comments = [];

		this.statements = this._parse( ast );

		// imports and exports, indexed by ID
		this.imports = blank();
		this.exports = blank();

		this.exportAlls = blank();

		// array of all-export sources
		this.exportDelegates = [];

		// this.canonicalNames = blank();

		this.definitions = blank();
		this.definitionPromises = blank();
		this.modifications = blank();

		this.analyse();
	}

	addExport ( statement ) {
		const node = statement.node;
		const source = node.source && node.source.value;

		// export default function foo () {}
		// export default foo;
		// export default 42;
		if ( node.type === 'ExportDefaultDeclaration' ) {
			const isDeclaration = /Declaration$/.test( node.declaration.type );
			const isAnonymous = /(?:Class|Function)Expression$/.test( node.declaration.type );

			const declaredName = isDeclaration && node.declaration.id.name;
			const identifier = node.declaration.type === 'Identifier' && node.declaration.name;


			if ( isDeclaration || identifier ) {
				this.scope.link( 'default', this.scope.getRef( declaredName || identifier ) );
			} else {
				this.scope.suggest( 'default', inferModuleName( this.id ) );
			}

			// this.scope.export( 'default' );

			this.definitions[ 'default' ] = statement;

			this.exports.default = {
				statement,
				name: 'default',
				localName: declaredName || 'default',
				declaredName,
				identifier,
				isDeclaration,
				isAnonymous,
				isModified: false // in case of `export default foo; foo = somethingElse`
			};
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

					this.exports[ exportedName ] = {
						localName,
						exportedName,
						source
					};

					// export { foo } from './foo';
					if ( source ) {
						this.imports[ localName ] = {
							source,
							localName,
							name: localName
						};

						// Exporting references from another module is handled in `mark( name )`.
						// this.scope.export( exportedName, null );
					} else {
						// We can export the local reference immediately.
						this.scope.export( exportedName, this.scope.getRef( localName ) );
					}
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

				this.scope.export( name, this.scope.add( name ) );

				this.exports[ name ] = {
					statement,
					localName: name,
					expression: declaration
				};
			}
		}

		// Store `export * from '...'` statements in an array of delegates.
		// When an unknown import is encountered, we see if one of them can satisfy it.
		else {
			this.exportDelegates.push({
				statement,
				source
			});
		}
	}

	addImport ( statement ) {
		const node = statement.node;
		const source = node.source.value;

		node.specifiers.forEach( specifier => {
			const isDefault = specifier.type === 'ImportDefaultSpecifier';
			const isNamespace = specifier.type === 'ImportNamespaceSpecifier';

			const localName = specifier.local.name;
			const name = isDefault ? 'default' :
				( isNamespace ? '*' : specifier.imported.name );

			if ( this.imports[ localName ] ) {
				const err = new Error( `Duplicated import '${localName}'` );
				err.file = this.id;
				err.loc = getLocation( this.source, specifier.start );
				throw err;
			}

			this.imports[ localName ] = {
				source,
				name,
				localName
			};
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
				this.scope.add( name );
				this.definitions[ name ] = statement;
			});

			keys( statement.modifies ).forEach( name => {
				( this.modifications[ name ] || ( this.modifications[ name ] = [] ) ).push( statement );
			});
		});

		// if names are referenced that are neither defined nor imported
		// in this module, we assume that they're globals
		this.statements.forEach( statement => {
			keys( statement.dependsOn ).forEach( name => {
				if ( !this.definitions[ name ] && !this.imports[ name ] ) {
					this.bundle.assumedGlobals[ name ] = true;
					this.scope.addFixed( name );
				}
			});
		});
	}

	consolidateDependencies () {
		let strongDependencies = blank();

		this.statements.forEach( statement => {
			if ( statement.isImportDeclaration && !statement.node.specifiers.length && !statement.module.isExternal ) {
				// include module for its side-effects
				strongDependencies[ statement.module.id ] = statement.module; // TODO is this right? `statement.module` should be `this`, surely?
			}

			keys( statement.stronglyDependsOn ).forEach( name => {
				if ( statement.defines[ name ] ) return;

				const exportAllDeclaration = this.exportAlls[ name ];

				if ( exportAllDeclaration && exportAllDeclaration.module && !exportAllDeclaration.module.isExternal ) {
					strongDependencies[ exportAllDeclaration.module.id ] = exportAllDeclaration.module;
					return;
				}

				const importDeclaration = this.imports[ name ];

				if ( importDeclaration && importDeclaration.module && !importDeclaration.module.isExternal ) {
					strongDependencies[ importDeclaration.module.id ] = importDeclaration.module;
				}
			});
		});

		let weakDependencies = blank();

		this.statements.forEach( statement => {
			keys( statement.dependsOn ).forEach( name => {
				if ( statement.defines[ name ] ) return;

				const importDeclaration = this.imports[ name ];

				if ( importDeclaration && importDeclaration.module && !importDeclaration.module.isExternal ) {
					weakDependencies[ importDeclaration.module.id ] = importDeclaration.module;
				}
			});
		});

		return { strongDependencies, weakDependencies };
	}

	fetchModule ( importDeclaration ) {
		if ( importDeclaration.module )
			return Promise.resolve( importDeclaration.module );

		return this.bundle.fetchModule( importDeclaration.source, this.id )
			.then( module => importDeclaration.module = module );
	}

	findDefiningStatement ( name ) {
		if ( this.definitions[ name ] ) return this.definitions[ name ];

		// TODO what about `default`/`*`?

		const importDeclaration = this.imports[ name ];
		if ( !importDeclaration ) return null;

		return Promise.resolve( importDeclaration.module || this.bundle.fetchModule( importDeclaration.source, this.id ) )
			.then( module => {
				importDeclaration.module = module;
				return module.findDefiningStatement( name );
			});
	}

	findDeclaration ( localName ) {
		const importDeclaration = this.imports[ localName ];

		// name was defined by another module
		if ( importDeclaration ) {
			const module = importDeclaration.module;

			if ( module.isExternal ) return null;

			const exportDeclaration = module.exports[ importDeclaration.name ];
			return module.findDeclaration( exportDeclaration.localName );
		}

		// name was defined by this module, if any
		let i = this.statements.length;
		while ( i-- ) {
			const declaration = this.statements[i].scope.declarations[ localName ];
			if ( declaration ) {
				return declaration;
			}
		}

		return null;
	}

	getCanonicalName ( localName, direct ) {
		return this.scope.get( localName, direct );
	}

	mark ( name ) {
		// shortcut cycles. TODO this won't work everywhere...
		if ( this.definitionPromises[ name ] ) {
			return emptyArrayPromise;
		}

		let promise;

		// The definition for this name is in a different module
		if ( this.imports[ name ] ) {
			const importDeclaration = this.imports[ name ];

			promise = this.fetchModule( importDeclaration ).then( module => {

				if ( module.isExternal ) {
					const importName = importDeclaration.name;
					const ref = module.scope.getExportRef( importName );

					this.scope.link( name, ref );

					if ( importName === 'default' ) {
						module.needsDefault = true;
						console.log('// suggesting default name', module.scope.name );
						this.scope.suggest( name, module.scope.name );
					} else if ( importName === '*' ) {
						module.needsAll = true;
					} else {
						module.needsNamed = true;
					}

					if ( this.exports[ name ] ) {
						console.log(`// ${this.scope.name} exports external ${name}!`);
						this.scope.export( name, ref );
					}

					module.importedByBundle.push( importDeclaration );
					return emptyArrayPromise;
				}


				// suggest names. TODO should this apply to non default/* imports?
				if ( importDeclaration.name === 'default' ) {
					module.scope.suggest( 'default', name );
					this.scope.link( name, module.scope.getRef( 'default' ) );

				} else if ( importDeclaration.name === '*' ) {
					const localName = importDeclaration.localName;

					module.suggestName( '*', localName );
					module.suggestName( 'default', `${localName}__default` );
				}


				if ( importDeclaration.name === '*' ) {
					// we need to create an internal namespace
					if ( !~this.bundle.internalNamespaceModules.indexOf( module ) ) {
						this.bundle.internalNamespaceModules.push( module );
					}

					return module.markAllStatements();
				}

				const exportDeclaration = module.exports[ importDeclaration.name ];

				if ( !exportDeclaration ) {
					const noExport = new Error( `Module ${module.id} does not export ${importDeclaration.name} (imported by ${this.id})` );

					// See if there exists an export delegate that defines `name`.
					return first( module.exportDelegates, noExport, declaration => {
						return module.bundle.fetchModule( declaration.source, module.id ).then( submodule => {
							declaration.module = submodule;

							return submodule.mark( name ).then( result => {
								if ( !result.length ) throw noExport;

								// It's found! This module exports `name` through declaration.
								// It is however not imported into this scope.
								module.exportAlls[ name ] = declaration;

								declaration.statement.dependsOn[ name ] =
								declaration.statement.stronglyDependsOn[ name ] = result;

								return result;
							});
						});
					});
				}

				const localName = module.exports[ importDeclaration.name ].localName;
				const ref = module.scope.getRef( localName );

				this.scope.link( name, ref );

				// TODO: this might be all wrong.
				if ( exportDeclaration ) {
					console.log(`// ${this.scope.name} exports internal ${name} as ${localName}!`);
					this.scope.export( name, ref );
				} else {
					console.log(`// has internal ${name}`);
				}

				exportDeclaration.isUsed = true;
				return module.mark( exportDeclaration.localName );
			});
		}

		// export { a as b, ... } from 'source'
		else if ( this.exports[ name ] && this.exports[ name ].source ) {
			return this.fetchModule( this.exports[ name ] ).then( module => {
				const localName = this.exports[ name ].localName;
				this.scope.export( name, module.scope.getExportRef( localName ) );
				return module.mark( localName );
			});
		}

		// The definition is in this module
		else if ( name === 'default' && this.exports.default.isDeclaration ) {
			// We have something like `export default foo` - so we just start again,
			// searching for `foo` instead of default
			promise = this.mark( this.exports.default.name );
		}

		else {
			let statement;

			statement = name === 'default' ? this.exports.default.statement : this.definitions[ name ];
			promise = statement && !statement.isIncluded ? statement.mark() : emptyArrayPromise;

			// Special case - `export default foo; foo += 1` - need to be
			// vigilant about maintaining the correct order of the export
			// declaration. Otherwise, the export declaration will always
			// go at the end of the expansion, because the expansion of
			// `foo` will include statements *after* the declaration
			if ( name === 'default' && this.exports.default.identifier && this.exports.default.isModified ) {
				const defaultExportStatement = this.exports.default.statement;
				promise = promise.then( statements => {
					// remove the default export statement...
					// TODO could this be statements.pop()?
					statements.splice( statements.indexOf( defaultExportStatement ), 1 );

					let i = statements.length;
					let inserted = false;

					while ( i-- ) {
						if ( statements[i].module === this && statements[i].index < defaultExportStatement.index ) {
							statements.splice( i + 1, 0, defaultExportStatement );
							inserted = true;
							break;
						}
					}

					if ( !inserted ) statements.push( statement );
					return statements;
				});
			}
		}

		this.definitionPromises[ name ] = promise || emptyArrayPromise;
		return this.definitionPromises[ name ];
	}

	markAllStatements ( isEntryModule ) {
		return sequence( this.statements, statement => {
			if ( statement.isIncluded ) return; // TODO can this happen? probably not...

			// skip import declarations...
			if ( statement.isImportDeclaration ) {
				// ...unless they're empty, in which case assume we're importing them for the side-effects
				// THIS IS NOT FOOLPROOF. Probably need /*rollup: include */ or similar
				if ( !statement.node.specifiers.length ) {
					return this.bundle.fetchModule( statement.node.source.value, this.id )
						.then( module => {
							statement.module = module;
							if ( module.isExternal ) {
								return;
							}
							return module.markAllStatements();
						});
				}

				return;
			}

			// skip `export { foo, bar, baz }`...
			if ( statement.node.type === 'ExportNamedDeclaration' && statement.node.specifiers.length ) {
				// ...but ensure they are defined, if this is the entry module
				if ( isEntryModule ) {
					return statement.mark();
				}

				return;
			}

			// include everything else
			return statement.mark();
		});
	}

	// TODO rename this to parse, once https://github.com/rollup/rollup/issues/42 is fixed
	_parse ( ast ) {
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

	render ( allBundleExports, direct ) {
		let magicString = this.magicString.clone();

		this.statements.forEach( statement => {
			if ( !statement.isIncluded ) {
				magicString.remove( statement.start, statement.next );
				return;
			}

			const node = statement.node;
			const module = statement.module;

			// skip `export { foo, bar, baz }`
			if ( node.type === 'ExportNamedDeclaration' ) {
				// skip `export { foo, bar, baz }`
				if ( node.specifiers.length ) {
					magicString.remove( statement.start, statement.next );
					return;
				}

				// skip `export var foo;` if foo is exported
				if ( isEmptyExportedVarDeclaration( node.declaration, module, allBundleExports, direct ) ) {
					magicString.remove( statement.start, statement.next );
					return;
				}
			}

			// skip empty var declarations for exported bindings
			// (otherwise we're left with `exports.foo;`, which is useless)
			if ( isEmptyExportedVarDeclaration( node, module, allBundleExports, direct ) ) {
				magicString.remove( statement.start, statement.next );
				return;
			}

			// split up/remove var declarations as necessary
			if ( node.isSynthetic ) {
				// insert `var/let/const` if necessary
				if ( !allBundleExports[ statement.node.declarations[0].id.name ] ) {
					magicString.insert( statement.start, `${node.kind} ` );
				}

				magicString.overwrite( statement.end, statement.next, ';\n' ); // TODO account for trailing newlines
			}

			let replacements = blank();
			let bundleExports = blank();

			keys( statement.dependsOn )
				.concat( keys( statement.defines ) )
				.forEach( name => {
					const canonicalName = module.getCanonicalName( name, direct );

					if ( allBundleExports[ canonicalName ] ) {
						bundleExports[ name ] = replacements[ name ] = allBundleExports[ canonicalName ];
					} else if ( name !== canonicalName ) {
						replacements[ name ] = canonicalName;
					}
				});

			statement.replaceIdentifiers( magicString, replacements, bundleExports, direct );

			// modify exports as necessary
			if ( statement.isExportDeclaration ) {
				const declaration = node.declaration;
				const declStart = declaration.start;

				// remove `export` from `export var foo = 42`
				if ( node.type === 'ExportNamedDeclaration' && declaration.type === 'VariableDeclaration' ) {
					magicString.remove( node.start, declStart );

					// If it's not a direct access (i.e. through `exports`),
					// also remove `var`, `let` or `const` from `var exports.foo = 42`
					// TODO: hack! only handles single identifiers
					if ( module.scope.isExported( declaration.declarations[0].id.name ) && !direct ) {
						magicString.remove( node.start, declStart + declaration.kind.length + 1 );
					}
				}

				// remove `export` from `export class Foo {...}` or `export default Foo`
				// TODO default exports need different treatment
				else if ( declaration.id ) {
					magicString.remove( node.start, declStart );
				}

				else if ( node.type === 'ExportDefaultDeclaration' ) {
					const canonicalName = module.getCanonicalName( 'default', direct );

					if ( declaration.type === 'Identifier' && canonicalName === module.getCanonicalName( declaration.name, direct ) ) {
						magicString.remove( statement.start, statement.next );
						return;
					}

					// anonymous functions should be converted into declarations
					if ( declaration.type === 'FunctionExpression' ) {
						magicString.overwrite( node.start, declStart + 8, `function ${canonicalName}` );
					} else {
						magicString.overwrite( node.start, declStart, `var ${canonicalName} = ` );
					}
				}

				else {
					throw new Error( 'Unhandled export' );
				}
			}
		});

		return magicString.trim();
	}

	suggestName ( defaultOrBatch, suggestion ) {
		this.scope.suggest( defaultOrBatch, suggestion );
	}
}
