import { resolve, sep } from 'path';
import { readFile } from 'sander';
import MagicString from 'magic-string';
import { hasOwnProp } from '../utils/object';
import { sequence } from '../utils/promise';
import Module from '../Module/index';

export default class Bundle {
	constructor ( options ) {
		this.base = options.base;
		this.entryPath = resolve( this.base, options.entry );
		this.entryModule = null;

		this.modulePromises = {};
		this.modules = {};

		// this will store the top-level AST nodes we import
		this.body = [];

		// this will store per-module names, and enable deconflicting
		this.names = {};
		this.usedNames = {};
	}

	collect () {
		return this.build()
			.then( () => {
				return this;
			});
	}

	fetchModule ( path ) {
		if ( !hasOwnProp.call( this.modulePromises, path ) ) {
			this.modulePromises[ path ] = readFile( path, { encoding: 'utf-8' })
				.then( code => {
					const module = new Module({
						path,
						code,
						bundle: this
					});

					this.modules[ path ] = module;
					return module;
				});
		}

		return this.modulePromises[ path ];
	}

	build () {
		// bring in top-level AST nodes from the entry module
		return this.fetchModule( this.entryPath )
			.then( entryModule => {
				this.entryModule = entryModule;

				// pull in imports
				return sequence( Object.keys( entryModule.imports ), name => {
					return entryModule.define( name )
						.then( nodes => {
							this.body.push.apply( this.body, nodes );
						});
				})
					.then( () => {
						entryModule.ast.body.forEach( node => {
							// exclude imports and exports, include everything else
							if ( !/^(?:Im|Ex)port/.test( node.type ) ) {
								this.body.push( node );
							}
						});
					});
			});
	}

	generate () {
		const bundle = new MagicString.Bundle();

		this.body.forEach( statement => {
			bundle.addSource( statement._source );
		});

		return {
			code: bundle.toString(),
			map: null // TODO use bundle.generateMap()
		};

		// try {
			// const code = generate({
			// 	type: 'Program',
			// 	body: this.body
			// });

			// const code = this.body.map( statement => statement._source.toString ).join( '\n' );

			// return {
			// 	code,
			// 	map: null // TODO...
			// };
		// } catch ( err ) {
		// 	// probably an escodegen error
		// 	console.log( 'this.body', this.body );
		// 	console.log( 'err.stack', err.stack );
		// 	throw err;
		// }
	}

	getName ( module, localName ) {
		if ( !hasOwnProp.call( this.names, module.path ) ) {
			this.names[ module.path ] = {};
		}

		const moduleNames = this.names[ module.path ];

		if ( !moduleNames ) {
			throw new Error( `Could not get name for ${module.relativePath}:${localName}` );
		}

		return moduleNames[ localName ];
	}

	suggestName ( module, localName, globalName ) {
		if ( !hasOwnProp.call( this.names, module.path ) ) {
			this.names[ module.path ] = {};
		}

		const moduleNames = this.names[ module.path ];

		if ( !hasOwnProp.call( moduleNames, globalName ) ) {
			const relativePathParts = module.relativePath.split( sep );

			while ( hasOwnProp.call( this.usedNames, globalName ) && relativePathParts.length ) {
				globalName = relativePathParts.pop() + `__${globalName}`;
			}

			while ( hasOwnProp.call( this.usedNames, globalName ) ) {
				globalName = `_${globalName}`;
			}

			this.usedNames[ globalName ] = true;
			moduleNames[ localName ] = globalName;
		}
	}
}