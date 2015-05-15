import { dirname, relative, resolve } from 'path';
import { Promise } from 'sander';
import { parse } from 'acorn';
import MagicString from 'magic-string';
import analyse from '../ast/analyse';
import { hasOwnProp } from '../utils/object';
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

		console.log( '\nanalysing %s\n========', path );
		analyse( this.ast, this.code );
		console.log( '========\n\n' );

		this.definitions = {};
		this.definitionPromises = {};
		this.modifications = {};

		this.ast.body.forEach( statement => {
			Object.keys( statement._defines ).forEach( name => {
				this.definitions[ name ] = statement;
			});

			Object.keys( statement._modifies ).forEach( name => {
				this.modifications[ name ] = statement;
			});
		});

		this.imports = {};
		this.exports = {};

		this.ast.body.forEach( node => {
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

			else if ( node.type === 'ExportDefaultDeclaration' ) {
				const isDeclaration = /Declaration$/.test( node.declaration.type );

				this.exports.default = {
					node,
					localName: 'default',
					name: isDeclaration ? node.declaration.id.name : null,
					isDeclaration
				};
			}

			else if ( node.type === 'ExportNamedDeclaration' ) {
				let declaration = node.declaration;

				if ( declaration ) {
					let name;

					if ( declaration.type === 'VariableDeclaration' ) {
						// `export var foo = /*...*/`
						name = declaration.declarations[0].id.name;
					} else {
						// `export function foo () {/*...*/}`
						name = declaration.id.name;
					}

					this.exports[ name ] = {
						localName: name,
						expression: node.declaration
					};
				}

				else if ( node.specifiers ) {
					node.specifiers.forEach( specifier => {
						const localName = specifier.local.name;
						const exportedName = specifier.exported.name;

						this.exports[ exportedName ] = {
							localName
						};
					});
				}

			}
		});
	}

	define ( name ) {
		// shortcut cycles. TODO this won't work everywhere...
		if ( hasOwnProp.call( this.definitionPromises, name ) ) {
			return emptyArrayPromise;
		}

		if ( !hasOwnProp.call( this.definitionPromises, name ) ) {
			let promise;

			// The definition for this name is in a different module
			if ( hasOwnProp.call( this.imports, name ) ) {
				const importDeclaration = this.imports[ name ];
				const path = resolve( dirname( this.path ), importDeclaration.source ) + '.js';

				promise = this.bundle.fetchModule( path )
					.then( module => {
						const exportDeclaration = module.exports[ importDeclaration.name ];

						if ( !exportDeclaration ) {
							throw new Error( `Module ${module.path} does not export ${importDeclaration.name} (imported by ${this.path})` );
						}

						// we 'suggest' that the bundle use our local name for this import
						// throughout the bundle. If that causes a conflict, we'll end up
						// with something slightly different
						this.bundle.suggestName( module, exportDeclaration.localName, importDeclaration.localName );

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
					const name = this.bundle.getName( this, 'default' );

					statement = this.exports.default.node;

					if ( !statement._imported ) {
						statement._source.overwrite( statement.start, statement.declaration.start, `var ${name} = ` )
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

					promise = sequence( Object.keys( statement._dependsOn ), name => {
						return this.define( name );
					})
						.then( definitions => {
							definitions.forEach( definition => nodes.push.apply( nodes, definition ) );
						})
						.then( () => {
							statement._imported = true;
							nodes.push( statement );
						})
						.then( () => {
							return nodes;
						});
				}
			}

			this.definitionPromises[ name ] = promise || emptyArrayPromise;
		}

		return this.definitionPromises[ name ];
	}
}