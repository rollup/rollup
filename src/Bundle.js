import { resolve } from 'path';
import { readFile } from 'sander';
import MagicString from 'magic-string';
import { keys, has } from './utils/object';
import { sequence } from './utils/promise';
import Module from './Module';
import ExternalModule from './ExternalModule';
import finalisers from './finalisers/index';
import replaceIdentifiers from './utils/replaceIdentifiers';
import makeLegalIdentifier from './utils/makeLegalIdentifier';

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
		// TODO currently, we'll get different ExternalModule objects
		// depending on where they're imported from...

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
						const module = new ExternalModule( id );

						this.externalModules.push( module );
						return module;
					}
				});
		}

		return this.modulePromises[ path ];
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
		// TODO this probably needs to happen at generate time, since
		// treatment of external modules differs between formats
		// e.g. this...
		//
		//     import { relative } from 'path'`;
		//     console.log( relative( 'foo', 'bar' ) );
		//
		// ...would look very similar when bundled as ES6, but in
		// a CommonJS bundle would become this:
		//
		//     var path = require( 'path' );
		//     console.log( path.relative( 'foo', 'bar' ) );
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

		// Assign names to external modules
		this.externalModules.forEach( module => {
			let name = makeLegalIdentifier( module.id );

			while ( has( definers, name ) ) {
				name = `_${name}`;
			}

			module.name = name;
		});

		// Rename conflicting identifiers so they can live in the same scope
		keys( conflicts ).forEach( name => {
			const modules = definers[ name ];

			modules.pop(); // the module closest to the entryModule gets away with keeping things as they are

			modules.forEach( module => {
				module.rename( name, name + '$' + ~~( Math.random() * 100000 ) ); // TODO proper deconfliction mechanism
			});
		});
	}

	generate ( options = {} ) {
		let magicString = new MagicString.Bundle({ separator: '' });

		// TODO we shouldn't be adding export statements back into the entry
		// module, they shouldn't be removed in the first place
		this.entryModule.exportStatements.forEach( statement => {
			if ( statement.specifiers.length ) {
				// we don't need to include `export { foo }`, it's already handled
				return;
			}

			if ( statement.declaration.type === 'VariableDeclaration' ) {
				statement._source.remove( statement.start, statement.declaration.start );
			} else {
				// TODO function, class declarations
			}

			this.body.push( statement );
		});

		// Apply new names and add to the output bundle
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

			const source = statement._source.clone();

			replaceIdentifiers( statement, source, replacements );
			magicString.addSource( source );
		});

		const finalise = finalisers[ options.format || 'es6' ];

		if ( !finalise ) {
			throw new Error( `You must specify an output type - valid options are ${keys( finalisers ).join( ', ' )}` );
		}

		magicString = finalise( this, magicString, options );

		return {
			code: magicString.toString(),
			map: magicString.generateMap({
				// TODO
			})
		};
	}
}