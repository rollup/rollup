import { dirname, relative, resolve } from 'path';
import { Promise } from 'sander';
import { parse } from 'acorn';
import MagicString from 'magic-string';
import analyse from './ast/analyse';
import { has } from './utils/object';
import { sequence } from './utils/promise';
import getLocation from './utils/getLocation';
import makeLegalIdentifier from './utils/makeLegalIdentifier';

const emptyArrayPromise = Promise.resolve([]);

export default class Module {
	constructor ({ path, code, bundle }) {
		this.bundle = bundle;
		this.path = path;
		this.relativePath = relative( bundle.base, path ).slice( 0, -3 ); // remove .js

		this.code = new MagicString( code, {
			filename: path
		});

		this.suggestedNames = {};

		try {
			this.ast = parse( code, {
				ecmaVersion: 6,
				sourceType: 'module'
			});
		} catch ( err ) {
			err.file = path;
			throw err;
		}


		this.analyse();
	}

	analyse () {
		// imports and exports, indexed by ID
		this.imports = {};
		this.exports = {};

		this.ast.body.forEach( node => {
			let source;

			// import foo from './foo';
			// import { bar } from './bar';
			if ( node.type === 'ImportDeclaration' ) {
				source = node.source.value;

				node.specifiers.forEach( specifier => {
					const isDefault = specifier.type === 'ImportDefaultSpecifier';
					const isNamespace = specifier.type === 'ImportNamespaceSpecifier';

					const localName = specifier.local.name;
					const name = isDefault ? 'default' : isNamespace ? '*' : specifier.imported.name;

					if ( has( this.imports, localName ) ) {
						const err = new Error( `Duplicated import '${localName}'` );
						err.file = this.path;
						err.loc = getLocation( this.code.original, specifier.start );
						throw err;
					}

					this.imports[ localName ] = {
						source,
						name,
						localName
					};
				});
			}

			else if ( /^Export/.test( node.type ) ) {
				// export default function foo () {}
				// export default foo;
				// export default 42;
				if ( node.type === 'ExportDefaultDeclaration' ) {
					const isDeclaration = /Declaration$/.test( node.declaration.type );

					this.exports.default = {
						node,
						name: 'default',
						localName: isDeclaration ? node.declaration.id.name : 'default',
						isDeclaration
					};
				}

				// export { foo, bar, baz }
				// export var foo = 42;
				// export function foo () {}
				else if ( node.type === 'ExportNamedDeclaration' ) {
					// export { foo } from './foo';
					source = node.source && node.source.value;

					if ( node.specifiers.length ) {
						// export { foo, bar, baz }
						node.specifiers.forEach( specifier => {
							const localName = specifier.local.name;
							const exportedName = specifier.exported.name;

							this.exports[ exportedName ] = {
								localName,
								exportedName
							};

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
							node,
							localName: name,
							expression: declaration
						};
					}
				}
			}
		});



		analyse( this.ast, this.code, this );

		this.definedNames = this.ast._scope.names.slice();

		this.canonicalNames = {};

		this.definitions = {};
		this.definitionPromises = {};
		this.modifications = {};

		this.ast.body.forEach( statement => {
			Object.keys( statement._defines ).forEach( name => {
				this.definitions[ name ] = statement;
			});

			Object.keys( statement._modifies ).forEach( name => {
				if ( !has( this.modifications, name ) ) {
					this.modifications[ name ] = [];
				}

				this.modifications[ name ].push( statement );
			});
		});
	}

	getCanonicalName ( name ) {
		if ( has( this.suggestedNames, name ) ) {
			name = this.suggestedNames[ name ];
		}

		if ( !has( this.canonicalNames, name ) ) {
			let canonicalName;

			if ( has( this.imports, name ) ) {
				const importDeclaration = this.imports[ name ];
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
				canonicalName = name;
			}

			this.canonicalNames[ name ] = canonicalName;
		}

		return this.canonicalNames[ name ];
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

					if ( importDeclaration.name === 'default' ) {
						module.suggestName( 'default', importDeclaration.localName );
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
						module.suggestName( '*', importDeclaration.localName );

						// we need to create an internal namespace
						if ( !~this.bundle.internalNamespaceModules.indexOf( module ) ) {
							this.bundle.internalNamespaceModules.push( module );
						}

						return module.includeAllStatements();
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
				// We have an expression, e.g. `export default 42`. We have
				// to assign that expression to a variable
				const replacement = this.suggestedNames.default;

				statement = this.exports.default.node;

				if ( !statement._included ) {
					// if we have `export default foo`, we don't want to turn it into `var foo = foo`
					// - we want to remove it altogether (but keep the statement, so we can include
					// its dependencies). TODO is there an easier way to do this?
					const shouldRemove = statement.declaration.type === 'Identifier' && statement.declaration.name === replacement;

					if ( shouldRemove ) {
						statement._source.remove( statement.start, statement.end );
					} else {
						statement._source.overwrite( statement.start, statement.declaration.start, `var ${replacement} = ` );
					}
				}
			}

			else {
				statement = this.definitions[ name ];

				if ( statement && /^Export/.test( statement.type ) ) {
					statement._source.remove( statement.start, statement.declaration.start );
				}
			}

			if ( statement && !statement._included ) {
				const result = [];

				const include = statement => {
					if ( statement._included ) return emptyArrayPromise;
					statement._included = true;

					// We have a statement, and it hasn't been included yet. First, include
					// the statements it depends on
					const dependencies = Object.keys( statement._dependsOn );

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
							const modifications = has( this.modifications, name ) && this.modifications[ name ];

							if ( modifications ) {
								return sequence( modifications, statement => {
									if ( !statement._included ) {
										return include( statement );
									}
								});
							}
						})

					// the `result` is an array of statements needed to define `name`
						.then( () => {

							return result;
						});
				};

				promise = !statement._included ? include( statement ) : emptyArrayPromise;
			}
		}



		this.definitionPromises[ name ] = promise || emptyArrayPromise;
		return this.definitionPromises[ name ];
	}

	includeAllStatements () {
		return this.ast.body.filter( statement => {
			// skip already-included statements
			if ( statement._included ) return false;

			// skip import declarations
			if ( /^Import/.test( statement.type ) ) return false;

			// skip `export { foo, bar, baz }`
			if ( statement.type === 'ExportNamedDeclaration' && statement.specifiers.length ) return false;

			// include everything else



			// modify exports as necessary
			if ( /^Export/.test( statement.type ) ) {
				// remove `export` from `export var foo = 42`
				if ( statement.type === 'ExportNamedDeclaration' && statement.declaration.type === 'VariableDeclaration' ) {
					statement._source.remove( statement.start, statement.declaration.start );
				}

				// remove `export` from `export class Foo {...}` or `export default Foo`
				else if ( statement.declaration.id ) {
					statement._source.remove( statement.start, statement.declaration.start );
				}

				// declare variables for expressions
				else {
					statement._source.overwrite( statement.start, statement.declaration.start, `var TODO = ` );
				}
			}

			return true;
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
