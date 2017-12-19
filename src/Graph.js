import { timeStart, timeEnd } from './utils/flushTime.js';
import first from './utils/first.js';
import { blank, keys } from './utils/object.js';
import Module from './Module.js';
import ExternalModule from './ExternalModule.js';
import ensureArray from './utils/ensureArray.js';
import { load, makeOnwarn, resolveId } from './utils/defaults.js';
import { mapSequence } from './utils/promise.js';
import transform from './utils/transform.js';
import relativeId from './utils/relativeId.js';
import error from './utils/error.js';
import { isRelative, resolve } from './utils/path.js';
import GlobalScope from './ast/scopes/GlobalScope.js';
import Bundle from './Bundle.js';

export default class Graph {
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

		this.treeshake = options.treeshake !== false;
		if ( this.treeshake ) {
			this.treeshakingOptions = {
				propertyReadSideEffects: options.treeshake
					? options.treeshake.propertyReadSideEffects !== false
					: true,
				pureExternalModules: options.treeshake
					? options.treeshake.pureExternalModules
					: false
			};
			if ( this.treeshakingOptions.pureExternalModules === true ) {
				this.isPureExternalModule = () => true;
			} else if ( typeof this.treeshakingOptions.pureExternalModules === 'function' ) {
				this.isPureExternalModule = this.treeshakingOptions.pureExternalModules;
			} else if ( Array.isArray( this.treeshakingOptions.pureExternalModules ) ) {
				const pureExternalModules = new Set( this.treeshakingOptions.pureExternalModules );
				this.isPureExternalModule = id => pureExternalModules.has( id );
			} else {
				this.isPureExternalModule = () => false;
			}
		} else {
			this.isPureExternalModule = () => false;
		}

		this.resolveId = first(
			[ ( id, parentId ) => this.isExternal( id, parentId, false ) ? false : null ]
				.concat( this.plugins.map( plugin => plugin.resolveId ).filter( Boolean ) )
				.concat( resolveId )
		);

		this.resolveDynamicImport = first( this.plugins.map( plugin => plugin.resolveDynamicImport ).filter( Boolean ) );

		const loaders = this.plugins
			.map( plugin => plugin.load )
			.filter( Boolean );
		this.hasLoaders = loaders.length !== 0;
		this.load = first( loaders.concat( load ) );

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

		this.scope = new GlobalScope();

		// TODO strictly speaking, this only applies with non-ES6, non-default-only bundles
		[ 'module', 'exports', '_interopDefault' ].forEach( name => {
			this.scope.findVariable( name ); // creates global variable as side-effect
		} );

		this.onwarn = options.onwarn || makeOnwarn();

		this.varOrConst = options.preferConst ? 'const' : 'var';
		this.legacy = options.legacy;
		this.acornOptions = options.acorn || {};
	}


	link ( entryName ) {
		// Phase 1 – discovery. We load the entry module and find which
		// modules it imports, and import those, until we have all
		// of the entry module's dependencies
		return this.resolveId( entryName, undefined )
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
					message: `Could not resolve entry (${entryName})`
				} );
			}

			return this.fetchModule( id, undefined );
		} )
		.then( entryModule => {
			// Phase 2 – binding. We link references to their variables
			// to generate a complete picture of the bundle

			timeStart( 'phase 2' );

			this.modules.forEach( module => module.bindImportSpecifiers() );
			this.modules.forEach( module => module.bindReferences() );

			timeEnd( 'phase 2');

			return entryModule.id;
		} );
	}

	buildSingle ( entryModuleId ) {

		const entryModule = this.moduleById.get( entryModuleId );

		if ( !entryModule )
			throw new Error(`Entry module ${entryModuleId} not found.`);

		const bundle = new Bundle( entryModule, this, this.scope );

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
		this.externalModules = bundle.externalModules = this.externalModules.filter( module => {
			return module.used || !this.isPureExternalModule( module.id );
		} );

		bundle.sortOrderedModules();
		bundle.deconflict();

		timeEnd( 'phase 4' );

		return bundle;

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
					graph: this
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
					let isExternal = this.isExternal( externalId, module.id, true );

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
						module.resolvedIds[ source ] = resolvedId;
						return this.fetchModule( resolvedId, module.id );
					}
				} );
		} );
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
