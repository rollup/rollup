import { basename, dirname, extname, resolve } from 'path';
import { readFile, Promise } from 'sander';
import MagicString from 'magic-string';
import { keys, has } from './utils/object';
import { sequence } from './utils/promise';
import Module from './Module';
import ExternalModule from './ExternalModule';
import finalisers from './finalisers/index';
import replaceIdentifiers from './utils/replaceIdentifiers';
import makeLegalIdentifier from './utils/makeLegalIdentifier';
import { defaultResolver } from './utils/resolvePath';

function badExports ( option, keys ) {
	throw new Error( `'${option}' was specified for options.exports, but entry module has following exports: ${keys.join(', ')}` );
}

export default class Bundle {
	constructor ( options ) {
		this.entryPath = resolve( options.entry ).replace( /\.js$/, '' ) + '.js';
		this.base = dirname( this.entryPath );

		this.resolvePath = options.resolvePath || defaultResolver;

		this.entryModule = null;
		this.modulePromises = {};
		this.statements = [];
		this.externalModules = [];
		this.defaultExportName = null;
	}

	fetchModule ( importee, importer ) {
		return Promise.resolve( importer === null ? importee : this.resolvePath( importee, importer ) )
			.then( path => {
				if ( !path ) {
					// external module
					if ( !has( this.modulePromises, importee ) ) {
						const module = new ExternalModule( importee );
						this.externalModules.push( module );
						this.modulePromises[ importee ] = Promise.resolve( module );
					}

					return this.modulePromises[ importee ];
				}

				if ( !has( this.modulePromises, path ) ) {
					this.modulePromises[ path ] = readFile( path, { encoding: 'utf-8' })
						.then( code => {
							const module = new Module({
								path,
								code,
								bundle: this
							});

							return module;
						});
				}

				return this.modulePromises[ path ];
			});
	}

	build () {
		// bring in top-level AST nodes from the entry module
		return this.fetchModule( this.entryPath, null )
			.then( entryModule => {
				this.entryModule = entryModule;

				const importedNames = keys( entryModule.imports );

				// pull in imports
				return sequence( importedNames, name => {
					return entryModule.define( name )
						.then( nodes => {
							this.statements.push.apply( this.statements, nodes );
						});
				})
					.then( () => {
						entryModule.ast.body.forEach( node => {
							// Exclude imports
							if ( /^Import/.test( node.type ) ) return;

							// Exclude default exports that proxy a name
							// e.g. `export default foo`
							if ( node.type === 'ExportDefaultDeclaration' && /Declaration$/.test( node.declaration.type ) ) return;

							// Exclude specifier exports
							// e.g. `export { foo }`
							if ( node.type === 'ExportNamedDeclaration' && node.specifiers.length ) return;

							// Include everything else...

							if ( node.type === 'ExportDefaultDeclaration' ) {
								// TODO generic 'get deconflicted name' mechanism
								let defaultExportName = makeLegalIdentifier( basename( this.entryPath ).slice( 0, -extname( this.entryPath ).length ) );
								while ( this.entryModule.ast._scope.contains( defaultExportName ) ) {
									defaultExportName = `_${defaultExportName}`;
								}

								this.defaultExportName = defaultExportName;
								node._source.overwrite( node.start, node.declaration.start, `var ${defaultExportName} = ` );
							}

							if ( node.type === 'ExportNamedDeclaration' ) {
								// Remove the `export`
								node._source.remove( node.start, node.declaration.start );
							}

							// Include everything else
							this.statements.push( node );
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
		this.statements.forEach( statement => {
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

		// Determine export mode - 'default', 'named', 'none'
		let exportMode = this.getExportMode( options.exports );

		// Apply new names and add to the output bundle
		this.statements.forEach( statement => {
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

		magicString = finalise( this, magicString, exportMode, options );

		return {
			code: magicString.toString(),
			map: magicString.generateMap({
				includeContent: true,
				file: options.dest
				// TODO
			})
		};
	}

	getExportMode ( exportMode ) {
		const exportKeys = keys( this.entryModule.exports );

		if ( exportMode === 'default' ) {
			if ( exportKeys.length !== 1 || exportKeys[0] !== 'default' ) {
				badExports( 'default', exportKeys );
			}
		} else if ( exportMode === 'none' && exportKeys.length ) {
			badExports( 'none', exportKeys );
		}

		if ( !exportMode || exportMode === 'auto' ) {
			if ( exportKeys.length === 0 ) {
				exportMode = 'none';
			} else if ( exportKeys.length === 1 && exportKeys[0] === 'default' ) {
				exportMode = 'default';
			} else {
				exportMode = 'named';
			}
		}

		if ( !/(?:default|named|none)/.test( exportMode ) ) {
			throw new Error( `options.exports must be 'default', 'named', 'none', 'auto', or left unspecified (defaults to 'auto')` );
		}

		return exportMode;
	}
}
