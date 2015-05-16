import { resolve, sep } from 'path';
import { readFile } from 'sander';
import MagicString from 'magic-string';
import { hasOwnProp } from '../utils/object';
import { sequence } from '../utils/promise';
import Module from '../Module/index';
import finalisers from '../finalisers/index';
import replaceIdentifiers from '../utils/replaceIdentifiers';

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

		this.externalModules = [];
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

	generate ( options = {} ) {
		let magicString = new MagicString.Bundle();

		this.body.forEach( statement => {
			const module = statement._module;

			replaceIdentifiers( statement, statement._source, module.nameReplacements );
			magicString.addSource( statement._source );
		});

		const finalise = finalisers[ options.format || 'es6' ];

		if ( !finalise ) {
			throw new Error( `You must specify an output type - valid options are ${Object.keys( finalisers ).join( ', ' )}` );
		}

		magicString = finalise( this, magicString, options );

		return {
			code: magicString.toString(),
			map: magicString.generateMap({

			})
		};
	}
}