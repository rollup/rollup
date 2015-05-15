import { dirname, relative, resolve } from 'path';
import { parse } from 'acorn';
import MagicString from 'magic-string';
import analyse from '../ast/analyse';
import { hasOwnProp } from '../utils/object';
import { sequence } from '../utils/promise';

export default class Module {
	constructor ({ path, code, bundle }) {
		this.path = path;
		this.relativePath = relative( bundle.base, path );
		this.code = new MagicString( code );
		this.bundle = bundle;

		this.ast = parse( code, {
			ecmaVersion: 6,
			sourceType: 'module'
		});

		analyse( this.ast, this.code );

		this.definitions = {};
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
				//const isDeclaration = /Declaration$/.test( node)
				this.exports.default = {
					node,
					localName: 'default',
					isDeclaration: false,
					//expression: node.declaration
				};

				// special case - need to transfer top-level node tracking info to expression
				// TODO this is fugly, refactor it
				// if ( this.exports.default.expression ) {
				// 	this.exports.default.expression._dependsOn = node._dependsOn;
				// 	this.exports.default.expression._source = node._source;
				// }
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

	define ( name, importer ) {
		let statement;

		// The definition for this name is in a different module
		if ( hasOwnProp.call( this.imports, name ) ) {
			const importDeclaration = this.imports[ name ];
			const path = resolve( dirname( this.path ), importDeclaration.source ) + '.js';

			return this.bundle.fetchModule( path )
				.then( module => {
					const exportDeclaration = module.exports[ importDeclaration.name ];

					if ( !exportDeclaration ) {
						throw new Error( `Module ${module.path} does not export ${importDeclaration.name} (imported by ${this.path})` );
					}

					// we 'suggest' that the bundle use our local name for this import
					// throughout the bundle. If that causes a conflict, we'll end up
					// with something slightly different
					this.bundle.suggestName( module, exportDeclaration.localName, importDeclaration.localName );


					return module.define( exportDeclaration.localName, this );
				});
		}

		// The definition is in this module; it's the default export
		else if ( name === 'default' ) {
			const defaultExport = this.exports.default;

			// We have something like `export default foo` - so we just start again,
			// searching for `foo` instead of default
			if ( defaultExport.isDeclaration ) {
				return this.define( defaultExport.name, this );
			}

			// Otherwise, we have an expression, e.g. `export default 42`. We have
			// to assign that expression to a variable
			const name = this.bundle.getName( this, 'default' );

			statement = defaultExport.node;
			statement._source.overwrite( statement.start, statement.declaration.start, `var ${name} = ` )
		}

		else {
			statement = this.definitions[ name ];

			if ( /^Export/.test( statement.type ) ) {
				statement._source.remove( statement.start, statement.declaration.start );
			}
		}


		if ( statement ) {
			const nodes = [];

			return sequence( Object.keys( statement._dependsOn ), name => {
				return this.define( name, this );
			})
				.then( definitions => {
					definitions.forEach( definition => nodes.push.apply( nodes, definition ) );
				})
				.then( () => {
					nodes.push( statement );
				})
				.then( () => {
					return nodes;
				});
		} else {
			throw new Error( `Could not define ${name}` );
		}
	}
}