import { timeStart, timeEnd } from './utils/flushTime.js';
import { decode } from 'sourcemap-codec';
import { Bundle as MagicStringBundle } from 'magic-string';
import { find } from './utils/array.js';
import { blank, forOwn, keys } from './utils/object.js';
import finalisers from './finalisers/index.js';
import getExportMode from './utils/getExportMode.js';
import getIndentString from './utils/getIndentString.js';
import { runSequence } from './utils/promise.js';
import transformBundle from './utils/transformBundle.js';
import collapseSourcemaps from './utils/collapseSourcemaps.js';
import callIfFunction from './utils/callIfFunction.js';
import error from './utils/error.js';
import { dirname, isRelative, isAbsolute, normalize, relative, resolve } from './utils/path.js';

export default class Bundle {
	constructor ( entryModule, graph, globalScope ) {
		this.graph = graph;
		this.modules = graph.modules;
		this.externalModules = graph.externalModules;
		this.orderedModules = undefined;
		this.entryModule = entryModule;
		this.entryId = entryModule.id;
		this.scope = globalScope;
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
	
	getPathRelativeToEntryDirname ( resolvedId ) {
		if ( isRelative( resolvedId ) || isAbsolute( resolvedId ) ) {
			const entryDirname = dirname( this.entryId );
			const relativeToEntry = normalize( relative( entryDirname, resolvedId ) );

			return isRelative( relativeToEntry ) ? relativeToEntry : `./${relativeToEntry}`;
		}

		return resolvedId;
	}
  
	collectAddon ( initialAddon, addonName, sep = '\n' ) {
		return runSequence(
			 [ { pluginName: 'rollup', source: initialAddon } ]
				.concat(this.graph.plugins.map( (plugin, idx) => {
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
								`Could not retrieve ${addonName}. Check configuration of ${pluginName}.
	Error Message: ${err.message}`
							} );
						});
				})
		 )
		 .then(addons => addons.filter(Boolean).join(sep));
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
				const source = module.render( options.format === 'es', this.graph.legacy, options.freeze !== false );
				if ( source.toString().length ) {
					magicString.addSource( source );
					usedModules.push( module );
				}
			} );

			if ( !magicString.toString().trim() && this.entryModule.getExports().length === 0 && this.entryModule.getReexports().length === 0 ) {
				this.graph.warn( {
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

			return transformBundle( prevCode, this.graph.plugins, bundleSourcemapChain, options ).then( code => {
				if ( options.sourcemap ) {
					timeStart( 'sourcemap' );

					let file = options.sourcemapFile || options.file;
					if ( file ) file = resolve( typeof process !== 'undefined' ? process.cwd() : '', file );

					if ( this.graph.hasLoaders || find( this.graph.plugins, plugin => plugin.transform || plugin.transformBundle ) ) {
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

	sortOrderedModules () {
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

						this.graph.onwarn(
							`Module ${a.id} may be unable to evaluate without ${b.id}, but is included first due to a cyclical dependency. Consider swapping the import statements in ${parent} to ensure correct ordering`
						);
					}
				}
			} );
		}

		this.orderedModules = ordered;
	}
}
