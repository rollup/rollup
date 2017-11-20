import { timeStart, timeEnd } from './utils/flushTime.js';
import { decode } from 'sourcemap-codec';
import { Bundle as MagicStringBundle } from 'magic-string';
import first from './utils/first.js';
import { find } from './utils/array.js';
import { blank, forOwn, keys } from './utils/object.js';
import Module from './Module.js';
import ExternalModule from './ExternalModule.js';
import finalisers from './finalisers/index.js';
import ensureArray from './utils/ensureArray.js';
import { load, makeOnwarn, resolveId } from './utils/defaults.js';
import getExportMode from './utils/getExportMode.js';
import getIndentString from './utils/getIndentString.js';
import { mapSequence, runSequence } from './utils/promise.js';
import transform from './utils/transform.js';
import transformBundle from './utils/transformBundle.js';
import collapseSourcemaps from './utils/collapseSourcemaps.js';
import callIfFunction from './utils/callIfFunction.js';
import relativeId from './utils/relativeId.js';
import error from './utils/error.js';
import { dirname, isRelative, isAbsolute, normalize, relative, resolve } from './utils/path.js';
import BundleScope from './ast/scopes/BundleScope.js';

export default class Bundle {
	constructor ( options ) {
		this.cachedModules = new Map();
		if ( options.cache ) {
			options.cache.modules.forEach( module => {
				this.cachedModules.set( module.id, module );
			} );
		}

		this.plugins = ensureArray( options.plugins );

		options = this.plugins.reduce( ( acc, plugin ) => {
			if ( plugin.options ) return plugin.options( acc ) || acc;
			return acc;
		}, options );

		if ( !options.input ) {
			throw new Error( 'You must supply options.input to rollup' );
		}

		this.entry = options.input;
		this.entryId = null;
		this.entryModule = null;

		this.treeshake = options.treeshake !== false;

		if ( options.pureExternalModules === true ) {
			this.isPureExternalModule = () => true;
		} else if ( typeof options.pureExternalModules === 'function' ) {
			this.isPureExternalModule = options.pureExternalModules;
		} else if ( Array.isArray( options.pureExternalModules ) ) {
			const pureExternalModules = new Set( options.pureExternalModules );
			this.isPureExternalModule = id => pureExternalModules.has( id );
		} else {
			this.isPureExternalModule = () => false;
		}

		this.resolveId = first(
			[ id => this.isExternal( id ) ? false : null ]
				.concat( this.plugins.map( plugin => plugin.resolveId ).filter( Boolean ) )
				.concat( resolveId )
		);

		const loaders = this.plugins
			.map( plugin => plugin.load )
			.filter( Boolean );
		this.hasLoaders = loaders.length !== 0;
		this.load = first( loaders.concat( load ) );

		this.scope = new BundleScope();
		// TODO strictly speaking, this only applies with non-ES6, non-default-only bundles
		[ 'module', 'exports', '_interopDefault' ].forEach( name => {
			this.scope.findVariable( name ); // creates global variable as side-effect
		} );

		this.moduleById = new Map();
		this.modules = [];
		this.externalModules = [];

		this.context = String( options.context );

		const optionsModuleContext = options.moduleContext;
		if ( typeof optionsModuleContext === 'function' ) {
			this.getModuleContext = id => optionsModuleContext( id ) || this.context;
		} else if ( typeof optionsModuleContext === 'object' ) {
			const moduleContext = new Map();
			Object.keys( optionsModuleContext ).forEach( key => {
				moduleContext.set( resolve( key ), optionsModuleContext[ key ] );
			} );
			this.getModuleContext = id => moduleContext.get( id ) || this.context;
		} else {
			this.getModuleContext = () => this.context;
		}

		if ( typeof options.external === 'function' ) {
			this.isExternal = options.external;
		} else {
			const ids = ensureArray( options.external );
			this.isExternal = id => ids.indexOf( id ) !== -1;
		}

		this.onwarn = options.onwarn || makeOnwarn();

		this.varOrConst = options.preferConst ? 'const' : 'var';
		this.legacy = options.legacy;
		this.acornOptions = options.acorn || {};
	}

	collectAddon ( initialAddon, addonName, sep = '\n' ) {
		return runSequence(
			 [ { pluginName: 'rollup', source: initialAddon } ]
				.concat(this.plugins.map( (plugin, idx) => {
					return {
						pluginName: plugin.name || `Plugin at pos ${idx}`,
						source: plugin[addonName]
					};
				} ))
				.map( addon => {
					addon.source = callIfFunction(addon.source);
					return addon;
				} )
				.filter( addon => {
					return addon.source;
				} )
				.map(({pluginName, source}) => {
					return Promise.resolve(source)
						.catch(err => {
							error( {
								code: 'ADDON_ERROR',
								message:
								`Could not resolve one of ${addonName}. Check configuration of ${pluginName}.
	Error Message: ${err.message}
	Error Stack: ${err.stack}`
							} );
						});
				})
		 )
		 .then(addons => addons.filter(Boolean).join(sep));
	}

	build () {
		// Phase 1 – discovery. We load the entry module and find which
		// modules it imports, and import those, until we have all
		// of the entry module's dependencies
		return this.resolveId( this.entry, undefined )
			.then( id => {
				if ( id === false ) {
					error( {
						code: 'UNRESOLVED_ENTRY',
						message: `Entry module cannot be external`
					} );
				}

				if ( id == null ) {
					error( {
						code: 'UNRESOLVED_ENTRY',
						message: `Could not resolve entry (${this.entry})`
					} );
				}

				this.entryId = id;
				return this.fetchModule( id, undefined );
			} )
			.then( entryModule => {
				this.entryModule = entryModule;

				// Phase 2 – binding. We link references to their variables
				// to generate a complete picture of the bundle

				timeStart( 'phase 2' );

				this.modules.forEach( module => module.bindImportSpecifiers() );
				this.modules.forEach( module => module.bindReferences() );

				timeEnd( 'phase 2' );

				// Phase 3 – marking. We include all statements that should be included

				timeStart( 'phase 3' );

				// mark all export statements
				entryModule.getExports().forEach( name => {
					const variable = entryModule.traceExport( name );

					variable.exportName = name;
					variable.includeVariable();

					if ( variable.isNamespace ) {
						variable.needsNamespaceBlock = true;
					}
				} );

				entryModule.getReexports().forEach( name => {
					const variable = entryModule.traceExport( name );

					if ( variable.isExternal ) {
						variable.reexported = variable.module.reexported = true;
					} else {
						variable.exportName = name;
						variable.includeVariable();
					}
				} );

				// mark statements that should appear in the bundle
				if ( this.treeshake ) {
					let addedNewNodes;
					do {
						addedNewNodes = false;
						this.modules.forEach( module => {
							if ( module.includeInBundle() ) {
								addedNewNodes = true;
							}
						} );
					} while ( addedNewNodes );
				} else {
					// Necessary to properly replace namespace imports
					this.modules.forEach( module => module.includeAllInBundle() );
				}

				timeEnd( 'phase 3' );

				// Phase 4 – final preparation. We order the modules with an
				// enhanced topological sort that accounts for cycles, then
				// ensure that names are deconflicted throughout the bundle

				timeStart( 'phase 4' );

				// while we're here, check for unused external imports
				this.externalModules.forEach( module => {
					const unused = Object.keys( module.declarations )
						.filter( name => name !== '*' )
						.filter( name => !module.declarations[ name ].included && !module.declarations[ name ].reexported );

					if ( unused.length === 0 ) return;

					const names = unused.length === 1 ?
						`'${unused[ 0 ]}' is` :
						`${unused.slice( 0, -1 ).map( name => `'${name}'` ).join( ', ' )} and '${unused.slice( -1 )}' are`;

					this.warn( {
						code: 'UNUSED_EXTERNAL_IMPORT',
						source: module.id,
						names: unused,
						message: `${names} imported from external module '${module.id}' but never used`
					} );
				} );

				// prune unused external imports
				this.externalModules = this.externalModules.filter( module => {
					return module.used || !this.isPureExternalModule( module.id );
				} );

				this.orderedModules = this.sort();
				this.deconflict();

				timeEnd( 'phase 4' );

			} );
	}

	deconflict () {
		const used = blank();

		// ensure no conflicts with globals
		keys( this.scope.variables ).forEach( name => used[ name ] = 1 );

		function getSafeName ( name ) {
			while ( used[ name ] ) {
				name += `$${used[ name ]++}`;
			}

			used[ name ] = 1;
			return name;
		}

		const toDeshadow = new Set();

		this.externalModules.forEach( module => {
			const safeName = getSafeName( module.name );
			toDeshadow.add( safeName );
			module.name = safeName;

			// ensure we don't shadow named external imports, if
			// we're creating an ES6 bundle
			forOwn( module.declarations, ( declaration, name ) => {
				const safeName = getSafeName( name );
				toDeshadow.add( safeName );
				declaration.setSafeName( safeName );
			} );
		} );

		this.modules.forEach( module => {
			forOwn( module.scope.variables, variable => {
				if ( !variable.isDefault || !variable.hasId ) {
					variable.name = getSafeName( variable.name );
				}
			} );

			// deconflict reified namespaces
			const namespace = module.namespace();
			if ( namespace.needsNamespaceBlock ) {
				namespace.name = getSafeName( namespace.name );
			}
		} );

		this.scope.deshadow( toDeshadow );
	}

	fetchModule ( id, importer ) {
		// short-circuit cycles
		if ( this.moduleById.has( id ) ) return null;
		this.moduleById.set( id, null );

		return this.load( id )
			.catch( err => {
				let msg = `Could not load ${id}`;
				if ( importer ) msg += ` (imported by ${importer})`;

				msg += `: ${err.message}`;
				throw new Error( msg );
			} )
			.then( source => {
				if ( typeof source === 'string' ) return source;
				if ( source && typeof source === 'object' && source.code ) return source;

				// TODO report which plugin failed
				error( {
					code: 'BAD_LOADER',
					message: `Error loading ${relativeId( id )}: plugin load hook should return a string, a { code, map } object, or nothing/null`
				} );
			} )
			.then( source => {
				if ( typeof source === 'string' ) {
					source = {
						code: source,
						ast: null
					};
				}

				if ( this.cachedModules.has( id ) && this.cachedModules.get( id ).originalCode === source.code ) {
					return this.cachedModules.get( id );
				}

				return transform( this, source, id, this.plugins );
			} )
			.then( source => {
				const { code, originalCode, originalSourcemap, ast, sourcemapChain, resolvedIds } = source;

				const module = new Module( {
					id,
					code,
					originalCode,
					originalSourcemap,
					ast,
					sourcemapChain,
					resolvedIds,
					bundle: this
				} );

				this.modules.push( module );
				this.moduleById.set( id, module );

				return this.fetchAllDependencies( module ).then( () => {
					keys( module.exports ).forEach( name => {
						if ( name !== 'default' ) {
							module.exportsAll[ name ] = module.id;
						}
					} );
					module.exportAllSources.forEach( source => {
						const id = module.resolvedIds[ source ] || module.resolvedExternalIds[ source ];
						const exportAllModule = this.moduleById.get( id );
						if ( exportAllModule.isExternal ) return;

						keys( exportAllModule.exportsAll ).forEach( name => {
							if ( name in module.exportsAll ) {
								this.warn( {
									code: 'NAMESPACE_CONFLICT',
									reexporter: module.id,
									name,
									sources: [ module.exportsAll[ name ], exportAllModule.exportsAll[ name ] ],
									message: `Conflicting namespaces: ${relativeId( module.id )} re-exports '${name}' from both ${relativeId(
										module.exportsAll[ name ] )} and ${relativeId( exportAllModule.exportsAll[ name ] )} (will be ignored)`
								} );
							} else {
								module.exportsAll[ name ] = exportAllModule.exportsAll[ name ];
							}
						} );
					} );
					return module;
				} );
			} );
	}

	fetchAllDependencies ( module ) {
		return mapSequence( module.sources, source => {
			const resolvedId = module.resolvedIds[ source ];
			return ( resolvedId ? Promise.resolve( resolvedId ) : this.resolveId( source, module.id ) )
				.then( resolvedId => {
					const externalId = resolvedId || (isRelative( source ) ? resolve( module.id, '..', source ) : source);
					let isExternal = this.isExternal( externalId );

					if ( !resolvedId && !isExternal ) {
						if ( isRelative( source ) ) {
							error( {
								code: 'UNRESOLVED_IMPORT',
								message: `Could not resolve '${source}' from ${relativeId( module.id )}`
							} );
						}

						this.warn( {
							code: 'UNRESOLVED_IMPORT',
							source,
							importer: relativeId( module.id ),
							message: `'${source}' is imported by ${relativeId(
								module.id )}, but could not be resolved – treating it as an external dependency`,
							url: 'https://github.com/rollup/rollup/wiki/Troubleshooting#treating-module-as-external-dependency'
						} );
						isExternal = true;
					}

					if ( isExternal ) {
						module.resolvedExternalIds[ source ] = externalId;

						if ( !this.moduleById.has( externalId ) ) {
							const module = new ExternalModule( externalId );
							this.externalModules.push( module );
							this.moduleById.set( externalId, module );
						}

						const externalModule = this.moduleById.get( externalId );

						// add external declarations so we can detect which are never used
						Object.keys( module.imports ).forEach( name => {
							const importDeclaration = module.imports[ name ];
							if ( importDeclaration.source !== source ) return;

							externalModule.traceExport( importDeclaration.name );
						} );
					} else {
						if ( resolvedId === module.id ) {
							// need to find the actual import declaration, so we can provide
							// a useful error message. Bit hoop-jumpy but what can you do
							const declaration = module.ast.body.find( node => {
								return ( node.isImportDeclaration || node.isExportDeclaration ) && node.source.value === source;
							} );
							const declarationType = /Export/.test( declaration.type ) ? 'export' : 'import';
							module.error( {
								code: 'CANNOT_IMPORT_SELF',
								message: `A module cannot ${declarationType} itself`
							}, declaration.start );
						}

						module.resolvedIds[ source ] = resolvedId;
						return this.fetchModule( resolvedId, module.id );
					}
				} );
		} );
	}

	getPathRelativeToEntryDirname ( resolvedId ) {
		if ( isRelative( resolvedId ) || isAbsolute( resolvedId ) ) {
			const entryDirname = dirname( this.entryId );
			const relativeToEntry = normalize( relative( entryDirname, resolvedId ) );

			return isRelative( relativeToEntry ) ? relativeToEntry : `./${relativeToEntry}`;
		}

		return resolvedId;
	}

	render ( options = {} ) {
		return Promise.resolve().then(() => {
			return Promise.all([
				this.collectAddon( options.banner, 'banner' ),
				this.collectAddon( options.footer, 'footer' ),
				this.collectAddon( options.intro, 'intro', '\n\n' ),
				this.collectAddon( options.outro, 'outro', '\n\n' )
			]);
		}).then( ([banner, footer, intro, outro]) => {
			// Determine export mode - 'default', 'named', 'none'
			const exportMode = getExportMode( this, options );

			let magicString = new MagicStringBundle( { separator: '\n\n' } );
			const usedModules = [];

			timeStart( 'render modules' );

			this.orderedModules.forEach( module => {
				const source = module.render( options.format === 'es', this.legacy );
				if ( source.toString().length ) {
					magicString.addSource( source );
					usedModules.push( module );
				}
			} );

			if ( !magicString.toString().trim() && this.entryModule.getExports().length === 0 && this.entryModule.getReexports().length === 0 ) {
				this.warn( {
					code: 'EMPTY_BUNDLE',
					message: 'Generated an empty bundle'
				} );
			}

			timeEnd( 'render modules' );


			const indentString = getIndentString( magicString, options );

			const finalise = finalisers[ options.format ];
			if ( !finalise ) {
				error( {
					code: 'INVALID_OPTION',
					message: `Invalid format: ${options.format} - valid options are ${keys( finalisers ).join( ', ' )}`
				} );
			}

			timeStart( 'render format' );

			const optionsPaths = options.paths;
			const getPath = (
				typeof optionsPaths === 'function' ?
					( id => optionsPaths( id ) || this.getPathRelativeToEntryDirname( id ) ) :
					optionsPaths ?
						( id => optionsPaths.hasOwnProperty( id ) ? optionsPaths[ id ] : this.getPathRelativeToEntryDirname( id ) ) :
						id => this.getPathRelativeToEntryDirname( id )
			);

			if ( intro ) intro += '\n\n';
			if ( outro ) outro = `\n\n${outro}`;

			magicString = finalise( this, magicString.trim(), { exportMode, getPath, indentString, intro, outro }, options );

			timeEnd( 'render format' );

			if ( banner ) magicString.prepend( banner + '\n' );
			if ( footer ) magicString.append( '\n' + footer );

			const prevCode = magicString.toString();
			let map = null;
			const bundleSourcemapChain = [];

			return transformBundle( prevCode, this.plugins, bundleSourcemapChain, options ).then( code => {
				if ( options.sourcemap ) {
					timeStart( 'sourcemap' );

					let file = options.sourcemapFile || options.file;
					if ( file ) file = resolve( typeof process !== 'undefined' ? process.cwd() : '', file );

					if ( this.hasLoaders || find( this.plugins, plugin => plugin.transform || plugin.transformBundle ) ) {
						map = magicString.generateMap( {} );
						if ( typeof map.mappings === 'string' ) {
							map.mappings = decode( map.mappings );
						}
						map = collapseSourcemaps( this, file, map, usedModules, bundleSourcemapChain );
					} else {
						map = magicString.generateMap( { file, includeContent: true } );
					}

					map.sources = map.sources.map( normalize );

					timeEnd( 'sourcemap' );
				}

				if ( code[ code.length - 1 ] !== '\n' ) code += '\n';
				return { code, map };
			} );
		} );
	}

	sort () {
		let hasCycles;
		const seen = {};
		const ordered = [];

		const stronglyDependsOn = blank();
		const dependsOn = blank();

		this.modules.forEach( module => {
			stronglyDependsOn[ module.id ] = blank();
			dependsOn[ module.id ] = blank();
		} );

		this.modules.forEach( module => {
			function processStrongDependency ( dependency ) {
				if ( dependency === module || stronglyDependsOn[ module.id ][ dependency.id ] ) return;

				stronglyDependsOn[ module.id ][ dependency.id ] = true;
				dependency.strongDependencies.forEach( processStrongDependency );
			}

			function processDependency ( dependency ) {
				if ( dependency === module || dependsOn[ module.id ][ dependency.id ] ) return;

				dependsOn[ module.id ][ dependency.id ] = true;
				dependency.dependencies.forEach( processDependency );
			}

			module.strongDependencies.forEach( processStrongDependency );
			module.dependencies.forEach( processDependency );
		} );

		const visit = module => {
			if ( seen[ module.id ] ) {
				hasCycles = true;
				return;
			}

			seen[ module.id ] = true;

			module.dependencies.forEach( visit );
			ordered.push( module );
		};

		visit( this.entryModule );

		if ( hasCycles ) {
			ordered.forEach( ( a, i ) => {
				for ( i += 1; i < ordered.length; i += 1 ) {
					const b = ordered[ i ];

					// TODO reinstate this! it no longer works
					if ( stronglyDependsOn[ a.id ][ b.id ] ) {
						// somewhere, there is a module that imports b before a. Because
						// b imports a, a is placed before b. We need to find the module
						// in question, so we can provide a useful error message
						let parent = '[[unknown]]';
						const visited = {};

						const findParent = module => {
							if ( dependsOn[ module.id ][ a.id ] && dependsOn[ module.id ][ b.id ] ) {
								parent = module.id;
								return true;
							}
							visited[ module.id ] = true;
							for ( let i = 0; i < module.dependencies.length; i += 1 ) {
								const dependency = module.dependencies[ i ];
								if ( !visited[ dependency.id ] && findParent( dependency ) ) return true;
							}
						};

						findParent( this.entryModule );

						this.onwarn(
							`Module ${a.id} may be unable to evaluate without ${b.id}, but is included first due to a cyclical dependency. Consider swapping the import statements in ${parent} to ensure correct ordering`
						);
					}
				}
			} );
		}

		return ordered;
	}

	warn ( warning ) {
		warning.toString = () => {
			let str = '';

			if ( warning.plugin ) str += `(${warning.plugin} plugin) `;
			if ( warning.loc ) str += `${relativeId( warning.loc.file )} (${warning.loc.line}:${warning.loc.column}) `;
			str += warning.message;

			return str;
		};

		this.onwarn( warning );
	}
}
