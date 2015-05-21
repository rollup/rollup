import { relative } from 'path';
import { Promise } from 'sander';
import { parse } from 'acorn';
import MagicString from 'magic-string';
import Statement from './Statement';
import analyse from './ast/analyse';
import { has, keys } from './utils/object';
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
		this.relativePath = relative( bundle.base, path ).slice( 0, -3 ); // remove .js

		this.magicString = new MagicString( source, {
			filename: path
		});

		this.suggestedNames = {};
		this.comments = [];

		// Try to extract a list of top-level statements/declarations. If
		// the parse fails, attach file info and abort
		try {
			const ast = parse( source, {
				ecmaVersion: 6,
				sourceType: 'module',
				onComment: ( block, text, start, end ) => this.comments.push({ block, text, start, end })
			});

			this.statements = ast.body.map( node => {
				const magicString = this.magicString.snip( node.start, node.end );
				return new Statement( node, magicString, this );
			});
		} catch ( err ) {
			err.file = path;
			throw err;
		}

		this.importDeclarations = this.statements.filter( isImportDeclaration );
		this.exportDeclarations = this.statements.filter( isExportDeclaration );

		this.analyse();
	}

	analyse () {
		// imports and exports, indexed by ID
		this.imports = {};
		this.exports = {};

		this.importDeclarations.forEach( statement => {
			const node = statement.node;
			const source = node.source.value;

			node.specifiers.forEach( specifier => {
				const isDefault = specifier.type === 'ImportDefaultSpecifier';
				const isNamespace = specifier.type === 'ImportNamespaceSpecifier';

				const localName = specifier.local.name;
				const name = isDefault ? 'default' : isNamespace ? '*' : specifier.imported.name;

				if ( has( this.imports, localName ) ) {
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

				this.exports.default = {
					statement,
					name: 'default',
					localName: isDeclaration ? node.declaration.id.name : 'default',
					isDeclaration
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
								name: exportedName
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

		this.canonicalNames = {};

		this.definitions = {};
		this.definitionPromises = {};
		this.modifications = {};

		this.statements.forEach( statement => {
			Object.keys( statement.defines ).forEach( name => {
				this.definitions[ name ] = statement;
			});

			Object.keys( statement.modifies ).forEach( name => {
				if ( !has( this.modifications, name ) ) {
					this.modifications[ name ] = [];
				}

				this.modifications[ name ].push( statement );
			});
		});
	}

	getCanonicalName ( localName ) {
		if ( has( this.suggestedNames, localName ) ) {
			localName = this.suggestedNames[ localName ];
		}

		if ( !has( this.canonicalNames, localName ) ) {
			let canonicalName;

			if ( has( this.imports, localName ) ) {
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
		if ( has( this.definitionPromises, name ) ) {
			return emptyArrayPromise;
		}

		let promise;

		// The definition for this name is in a different module
		if ( has( this.imports, name ) ) {
			const importDeclaration = this.imports[ name ];

			promise = this.bundle.fetchModule( importDeclaration.source, this.path )
				.then( module => {
					importDeclaration.module = module;

					// suggest names. TODO should this apply to non default/* imports?
					if ( importDeclaration.name === 'default' ) {
						// TODO this seems ropey
						const localName = importDeclaration.localName;
						const suggestion = has( this.suggestedNames, localName ) ? this.suggestedNames[ localName ] : localName;
						module.suggestName( 'default', suggestion );
					} else if ( importDeclaration.name === '*' ) {
						const localName = importDeclaration.localName;
						const suggestion = has( this.suggestedNames, localName ) ? this.suggestedNames[ localName ] : localName;
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

			if ( name === 'default' ) {
				// TODO can we use this.definitions[ name ], as below?
				statement = this.exports.default.statement;
			}

			else {
				statement = this.definitions[ name ];
			}

			if ( statement && !statement.isIncluded ) {
				promise = this.expandStatement( statement );
			}
		}

		this.definitionPromises[ name ] = promise || emptyArrayPromise;
		return this.definitionPromises[ name ];
	}

	expandStatement ( statement ) {
		if ( statement.isIncluded ) return emptyArrayPromise;
		statement.isIncluded = true;

		let result = [];

		// We have a statement, and it hasn't been included yet. First, include
		// the statements it depends on
		const dependencies = Object.keys( statement.dependsOn );

		return sequence( dependencies, name => {
			return this.define( name ).then( definition => {
				result.push.apply( result, definition );
			});
		})

		// then include the statement itself
			.then( () => {
				result.push( statement );
			})

		// then include any statements that could modify the
		// thing(s) this statement defines
			.then( () => {
				return sequence( keys( statement.defines ), name => {
					const modifications = has( this.modifications, name ) && this.modifications[ name ];

					if ( modifications ) {
						return sequence( modifications, statement => {
							if ( !statement.isIncluded ) {
								return this.expandStatement( statement )
									.then( statements => {
										result.push.apply( result, statements );
									});
							}
						});
					}
				});
			})

		// the `result` is an array of statements needed to define `name`
			.then( () => {
				return result;
			});
	}

	expandAllStatements ( isEntryModule ) {
		let allStatements = [];

		return sequence( this.statements, statement => {
			// skip already-included statements
			if ( statement.isIncluded ) return;

			// skip import declarations
			if ( statement.node.type === 'ImportDeclaration' ) {
				// unless they're empty, in which case assume we're importing them for the side-effects
				// THIS IS NOT FOOLPROOF. Probably need /*rollup: include */ or similar
				if ( !statement.node.specifiers.length ) {
					return this.bundle.fetchModule( statement.node.source.value, this.path )
						.then( module => {
							statement.module = module; // TODO what is this for? what does it do? why not _module?
							return module.expandAllStatements();
						})
						.then( statements => {
							allStatements.push.apply( allStatements, statements );
						});
				}

				return;
			}

			// skip `export { foo, bar, baz }`
			if ( statement.node.type === 'ExportNamedDeclaration' && statement.node.specifiers.length ) {
				// but ensure they are defined, if this is the entry module
				if ( isEntryModule ) {
					return this.expandStatement( statement )
						.then( statements => {
							allStatements.push.apply( allStatements, statements );
						});
				}

				return;
			}

			// include everything else
			return this.expandStatement( statement )
				.then( statements => {
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
