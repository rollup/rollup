import { dirname, relative, resolve } from 'path';
import { Promise } from 'sander';
import { parse } from 'acorn';
import MagicString from 'magic-string';
import analyse from '../ast/analyse';
import { has } from '../utils/object';
import { sequence } from '../utils/promise';

const emptyArrayPromise = Promise.resolve([]);

export default class Module {
	constructor ({ path, code, bundle }) {
		this.path = path;
		this.relativePath = relative( bundle.base, path ).slice( 0, -3 ); // remove .js
		this.code = new MagicString( code );
		this.bundle = bundle;

		this.ast = parse( code, {
			ecmaVersion: 6,
			sourceType: 'module'
		});

		this.analyse();
	}

	analyse () {
		analyse( this.ast, this.code, this );

		this.definedNames = this.ast._scope.names.slice();

		this.nameReplacements = {};
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

		this.imports = {};
		this.exports = {};

		this.ast.body.forEach( node => {
			// import foo from './foo';
			// import { bar } from './bar';
			if ( node.type === 'ImportDeclaration' ) {
				const source = node.source.value;

				node.specifiers.forEach( specifier => {
					const name = specifier.local.name;
					const isDefault = specifier.type === 'ImportDefaultSpecifier';

					this.imports[ name ] = {
						source,
						name: isDefault ? 'default' : specifier.imported.name,
						localName: name
					};
				});
			}

			// export default function foo () {}
			// export default foo;
			// export default 42;
			else if ( node.type === 'ExportDefaultDeclaration' ) {
				const isDeclaration = /Declaration$/.test( node.declaration.type );

				this.exports.default = {
					node,
					name: 'default',
					localName: isDeclaration ? node.declaration.id.name : 'default',
					isDeclaration,
					module: null // filled in later
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
							localName
						};
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
						localName: name,
						expression: declaration
					};
				}
			}
		});
	}

	getCanonicalName ( name ) {
		if ( has( this.imports, name ) ) {
			const importDeclaration = this.imports[ name ];
			const module = importDeclaration.module;
			const exportDeclaration = module.exports[ importDeclaration.name ];

			return module.getCanonicalName( exportDeclaration.localName );
		}

		if ( name === 'default' ) {
			name = this.defaultExportName;
		}

		return has( this.canonicalNames, name ) ? this.canonicalNames[ name ] : name;
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
			const path = resolve( dirname( this.path ), importDeclaration.source ) + '.js';

			promise = this.bundle.fetchModule( path )
				.then( module => {
					importDeclaration.module = module;

					const exportDeclaration = module.exports[ importDeclaration.name ];

					if ( !exportDeclaration ) {
						throw new Error( `Module ${module.path} does not export ${importDeclaration.name} (imported by ${this.path})` );
					}

					if ( importDeclaration.name === 'default' ) {
						module.suggestDefaultName( importDeclaration.localName );
					}

					return module.define( exportDeclaration.localName );
				});
		}

		// The definition is in this module
		else if ( name === 'default' && this.exports.default.isDeclaration ) {
			// We have something like `export default foo` - so we just start again,
			// searching for `foo` instead of default. First, sync up names
			this.rename( 'default', this.exports.default.name );
			promise = this.define( this.exports.default.name );
		}

		else {
			let statement;

			if ( name === 'default' ) {
				// We have an expression, e.g. `export default 42`. We have
				// to assign that expression to a variable
				const replacement = this.defaultExportName;

				statement = this.exports.default.node;

				if ( !statement._imported ) {
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

			if ( statement && !statement._imported ) {
				const nodes = [];

				const include = statement => {
					if ( statement._imported ) return emptyArrayPromise;

					const dependencies = Object.keys( statement._dependsOn );

					return sequence( dependencies, name => this.define( name ) )
						.then( definitions => {
							definitions.forEach( definition => nodes.push.apply( nodes, definition ) );
						})
						.then( () => {
							statement._imported = true;
							nodes.push( statement );

							const modifications = has( this.modifications, name ) && this.modifications[ name ];

							if ( modifications ) {
								return sequence( modifications, include );
							}
						})
						.then( () => {
							return nodes;
						});
				};

				promise = include( statement );
			}
		}



		this.definitionPromises[ name ] = promise || emptyArrayPromise;
		return this.definitionPromises[ name ];
	}

	rename ( name, replacement ) {
		this.canonicalNames[ name ] = replacement;
	}

	suggestDefaultName ( name ) {
		if ( !this.defaultExportName ) {
			this.defaultExportName = name;
		}
	}
}