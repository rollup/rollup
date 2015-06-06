import { Promise } from 'sander';
import { parse } from 'acorn';
import MagicString from 'magic-string';
import Statement from './Statement';
import walk from './ast/walk';
import analyse from './ast/analyse';
import { blank, keys } from './utils/object';
import { sequence } from './utils/promise';
import { isImportDeclaration, isExportDeclaration } from './utils/map-helpers';
import getLocation from './utils/getLocation';
import makeLegalIdentifier from './utils/makeLegalIdentifier';

const emptyArrayPromise = Promise.resolve([]);

export default class Module {
	constructor ({ path, source, bundle }) {
		this.source = source;

		this.bundle = bundle;
		this.path = path;

		this.magicString = new MagicString( source, {
			filename: path
		});

		this.suggestedNames = blank();
		this.comments = [];

		// Try to extract a list of top-level statements/declarations. If
		// the parse fails, attach file info and abort
		try {
			const ast = parse( source, {
				ecmaVersion: 6,
				sourceType: 'module',
				onComment: ( block, text, start, end ) => this.comments.push({ block, text, start, end })
			});

			walk( ast, {
				enter: node => {
					this.magicString.addSourcemapLocation( node.start );
					this.magicString.addSourcemapLocation( node.end );
				}
			});

			this.statements = ast.body.map( ( node, i ) => {
				const magicString = this.magicString.snip( node.start, node.end ).trim();
				return new Statement( node, magicString, this, i );
			});
		} catch ( err ) {
			err.code = 'PARSE_ERROR';
			err.file = path;
			throw err;
		}

		this.importDeclarations = this.statements.filter( isImportDeclaration );
		this.exportDeclarations = this.statements.filter( isExportDeclaration );

		this.analyse();
	}

	analyse () {
		// imports and exports, indexed by ID
		this.imports = blank();
		this.exports = blank();

		this.importDeclarations.forEach( statement => {
			const node = statement.node;
			const source = node.source.value;

			node.specifiers.forEach( specifier => {
				const isDefault = specifier.type === 'ImportDefaultSpecifier';
				const isNamespace = specifier.type === 'ImportNamespaceSpecifier';

				const localName = specifier.local.name;
				const name = isDefault ? 'default' : isNamespace ? '*' : specifier.imported.name;

				if ( this.imports[ localName ] ) {
					const err = new Error( `Duplicated import '${localName}'` );
					err.file = this.path;
					err.loc = getLocation( this.source, specifier.start );
					throw err;
				}

				this.imports[ localName ] = {
					source,
					name,
					localName
				};
			});
		});

		this.exportDeclarations.forEach( statement => {
			const node = statement.node;
			const source = node.source && node.source.value;

			// export default function foo () {}
			// export default foo;
			// export default 42;
			if ( node.type === 'ExportDefaultDeclaration' ) {
				const isDeclaration = /Declaration$/.test( node.declaration.type );
				const declaredName = isDeclaration && node.declaration.id.name;
				const identifier = node.declaration.type === 'Identifier' && node.declaration.name;

				this.exports.default = {
					statement,
					name: 'default',
					localName: declaredName || 'default',
					declaredName,
					identifier,
					isDeclaration,
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
							exportedName
						};

						// export { foo } from './foo';
						if ( source ) {
							this.imports[ localName ] = {
								source,
								localName,
								name: localName
							};
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

					this.exports[ name ] = {
						statement,
						localName: name,
						expression: declaration
					};
				}
			}
		});

		analyse( this.magicString, this );

		this.canonicalNames = blank();

		this.definitions = blank();
		this.definitionPromises = blank();
		this.modifications = blank();

		this.statements.forEach( statement => {
			keys( statement.defines ).forEach( name => {
				this.definitions[ name ] = statement;
			});

			keys( statement.modifies ).forEach( name => {
				if ( !this.modifications[ name ] ) {
					this.modifications[ name ] = [];
				}

				this.modifications[ name ].push( statement );
			});
		});

		this.statements.forEach( statement => {
			keys( statement.dependsOn ).forEach( name => {
				if ( !this.definitions[ name ] && !this.imports[ name ] ) {
					this.bundle.assumedGlobals[ name ] = true;
				}
			});
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
			const statement = this.statements[i];
			const declaration = this.statements[i].scope.declarations[ localName ];
			if ( declaration ) {
				return declaration;
			}
		}

		return null;
	}

	getCanonicalName ( localName ) {
		// Special case
		if ( localName === 'default' && this.exports.default && this.exports.default.isModified ) {
			let canonicalName = makeLegalIdentifier( this.path.replace( this.bundle.base + '/', '' ).replace( /\.js$/, '' ) );
			while ( this.definitions[ canonicalName ] ) {
				canonicalName = `_${canonicalName}`;
			}

			return canonicalName;
		}

		if ( this.suggestedNames[ localName ] ) {
			localName = this.suggestedNames[ localName ];
		}

		if ( !this.canonicalNames[ localName ] ) {
			let canonicalName;

			if ( this.imports[ localName ] ) {
				const importDeclaration = this.imports[ localName ];
				const module = importDeclaration.module;

				if ( importDeclaration.name === '*' ) {
					canonicalName = module.suggestedNames[ '*' ];
				} else {
					let exporterLocalName;

					if ( module.isExternal ) {
						exporterLocalName = importDeclaration.name;
					} else {
						const exportDeclaration = module.exports[ importDeclaration.name ];
						exporterLocalName = exportDeclaration.localName;
					}

					canonicalName = module.getCanonicalName( exporterLocalName );
				}
			}

			else {
				canonicalName = localName;
			}

			this.canonicalNames[ localName ] = canonicalName;
		}

		return this.canonicalNames[ localName ];
	}

	define ( name ) {
		// shortcut cycles. TODO this won't work everywhere...
		if ( this.definitionPromises[ name ] ) {
			return emptyArrayPromise;
		}

		let promise;

		// The definition for this name is in a different module
		if ( this.imports[ name ] ) {
			const importDeclaration = this.imports[ name ];

			promise = this.bundle.fetchModule( importDeclaration.source, this.path )
				.then( module => {
					importDeclaration.module = module;

					// suggest names. TODO should this apply to non default/* imports?
					if ( importDeclaration.name === 'default' ) {
						// TODO this seems ropey
						const localName = importDeclaration.localName;
						let suggestion = this.suggestedNames[ localName ] || localName;

						// special case - the module has its own import by this name
						while ( !module.isExternal && module.imports[ suggestion ] ) {
							suggestion = `_${suggestion}`;
						}

						module.suggestName( 'default', suggestion );
					} else if ( importDeclaration.name === '*' ) {
						const localName = importDeclaration.localName;
						const suggestion = this.suggestedNames[ localName ] || localName;
						module.suggestName( '*', suggestion );
						module.suggestName( 'default', `${suggestion}__default` );
					}

					if ( module.isExternal ) {
						if ( importDeclaration.name === 'default' ) {
							module.needsDefault = true;
						} else {
							module.needsNamed = true;
						}

						module.importedByBundle.push( importDeclaration );
						return emptyArrayPromise;
					}

					if ( importDeclaration.name === '*' ) {
						// we need to create an internal namespace
						if ( !~this.bundle.internalNamespaceModules.indexOf( module ) ) {
							this.bundle.internalNamespaceModules.push( module );
						}

						return module.expandAllStatements();
					}

					const exportDeclaration = module.exports[ importDeclaration.name ];

					if ( !exportDeclaration ) {
						throw new Error( `Module ${module.path} does not export ${importDeclaration.name} (imported by ${this.path})` );
					}

					return module.define( exportDeclaration.localName );
				});
		}

		// The definition is in this module
		else if ( name === 'default' && this.exports.default.isDeclaration ) {
			// We have something like `export default foo` - so we just start again,
			// searching for `foo` instead of default
			promise = this.define( this.exports.default.name );
		}

		else {
			let statement;

			statement = name === 'default' ? this.exports.default.statement : this.definitions[ name ];
			promise = statement && !statement.isIncluded ? statement.expand() : emptyArrayPromise;

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

	expandAllStatements ( isEntryModule ) {
		let allStatements = [];

		return sequence( this.statements, statement => {
			// A statement may have already been included, in which case we need to
			// curb rollup's enthusiasm and move it down here. It remains to be seen
			// if this approach is bulletproof
			if ( statement.isIncluded ) {
				const index = allStatements.indexOf( statement );
				if ( ~index ) {
					allStatements.splice( index, 1 );
					allStatements.push( statement );
				}

				return;
			}

			// skip import declarations...
			if ( statement.isImportDeclaration ) {
				// ...unless they're empty, in which case assume we're importing them for the side-effects
				// THIS IS NOT FOOLPROOF. Probably need /*rollup: include */ or similar
				if ( !statement.node.specifiers.length ) {
					return this.bundle.fetchModule( statement.node.source.value, this.path )
						.then( module => {
							statement.module = module;
							return module.expandAllStatements();
						})
						.then( statements => {
							allStatements.push.apply( allStatements, statements );
						});
				}

				return;
			}

			// skip `export { foo, bar, baz }`...
			if ( statement.node.type === 'ExportNamedDeclaration' && statement.node.specifiers.length ) {
				// ...but ensure they are defined, if this is the entry module
				if ( isEntryModule ) {
					return statement.expand().then( statements => {
						allStatements.push.apply( allStatements, statements );
					});
				}

				return;
			}

			// include everything else
			return statement.expand().then( statements => {
				allStatements.push.apply( allStatements, statements );
			});
		}).then( () => {
			return allStatements;
		});
	}

	rename ( name, replacement ) {
		this.canonicalNames[ name ] = replacement;
	}

	suggestName ( exportName, suggestion ) {
		if ( !this.suggestedNames[ exportName ] ) {
			this.suggestedNames[ exportName ] = makeLegalIdentifier( suggestion );
		}
	}
}
