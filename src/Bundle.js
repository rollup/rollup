import { resolve } from 'path';
import { readFile } from 'sander';
import MagicString from 'magic-string';
import { keys, has } from './utils/object';
import { sequence } from './utils/promise';
import Module from './Module';
import finalisers from './finalisers/index';
import replaceIdentifiers from './utils/replaceIdentifiers';

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
		this.bindingNames = {};
		this.usedNames = {};

		this.externalModules = [];
	}

	fetchModule ( path, id ) {
		if ( !has( this.modulePromises, path ) ) {
			this.modulePromises[ path ] = readFile( path, { encoding: 'utf-8' })
				.then( code => {
					const module = new Module({
						path,
						code,
						bundle: this
					});

					this.modules[ path ] = module;
					return module;
				}, err => {
					if ( err.code === 'ENOENT' ) {
						if ( id[0] === '.' ) {
							// external modules can't have relative paths
							throw err;
						}

						// most likely an external module
						// TODO fire an event, or otherwise allow some way for
						// users to control external modules better?
						const module = {
							id,
							isExternal: true,
							specifiers: []
						};

						this.externalModules.push( module );
						return module;
					}
				});
		}

		return this.modulePromises[ path ];
	}

	getBindingNamesFor ( module ) {
		if ( !has( this.bindingNames, module.path ) ) {
			this.bindingNames[ module.path ] = {};
		}

		return this.bindingNames[ module.path ];
	}

	build () {
		// bring in top-level AST nodes from the entry module
		return this.fetchModule( this.entryPath )
			.then( entryModule => {
				this.entryModule = entryModule;

				const importedNames = keys( entryModule.imports );

				entryModule.definedNames
					.concat( importedNames )
					.forEach( name => {
						this.usedNames[ name ] = true;
					});

				// pull in imports
				return sequence( importedNames, name => {
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
			})
			.then( () => {
				this.deconflict();
			});

	}

	deconflict () {
		let definers = {};
		let conflicts = {};

		// Discover conflicts (i.e. two statements in separate modules both define `foo`)
		this.body.forEach( statement => {
			keys( statement._defines ).forEach( name => {
				if ( has( definers, name ) ) {
					conflicts[ name ] = true;
				} else {
					definers[ name ] = [];
				}

				// TODO in good js, there shouldn't be duplicate definitions
				// per module... but some people write bad js
				definers[ name ].push( statement._module );
			});
		});

		// Rename conflicting identifiers so they can live in the same scope
		keys( conflicts ).forEach( name => {
			const modules = definers[ name ];

			modules.pop(); // the module closest to the entryModule gets away with keeping things as they are

			modules.forEach( module => {
				module.rename( name, name + '$' + ~~( Math.random() * 100000 ) ); // TODO proper deconfliction mechanism
			});
		});

		// Apply new names
		this.body.forEach( statement => {
			let replacements = {};

			keys( statement._dependsOn )
				.concat( keys( statement._defines ) )
				.forEach( name => {
					const canonicalName = statement._module.getCanonicalName( name );

					if ( name !== canonicalName ) {
						replacements[ name ] = canonicalName;
					}
				});

			replaceIdentifiers( statement, statement._source, replacements );
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
			throw new Error( `You must specify an output type - valid options are ${keys( finalisers ).join( ', ' )}` );
		}

		magicString = finalise( this, magicString, options );

		return {
			code: magicString.toString(),
			map: magicString.generateMap({

			})
		};
	}
}