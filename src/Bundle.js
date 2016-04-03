import MagicString from 'magic-string';
import first from './utils/first.js';
import { blank, forOwn, keys } from './utils/object.js';
import Module from './Module.js';
import ExternalModule from './ExternalModule.js';
import finalisers from './finalisers/index.js';
import ensureArray from './utils/ensureArray.js';
import { load, makeOnwarn, resolveId } from './utils/defaults.js';
import getExportMode from './utils/getExportMode.js';
import getIndentString from './utils/getIndentString.js';
import { unixizePath } from './utils/normalizePlatform.js';
import { mapSequence } from './utils/promise.js';
import transform from './utils/transform.js';
import transformBundle from './utils/transformBundle.js';
import collapseSourcemaps from './utils/collapseSourcemaps.js';
import SOURCEMAPPING_URL from './utils/sourceMappingURL.js';
import callIfFunction from './utils/callIfFunction.js';
import { isRelative, resolve } from './utils/path.js';

export default class Bundle {
	constructor ( options ) {
		this.plugins = ensureArray( options.plugins );

		this.plugins.forEach( plugin => {
			if ( plugin.options ) {
				options = plugin.options( options ) || options;
			}
		});

		this.entry = unixizePath( options.entry );
		this.entryModule = null;

		this.resolveId = first(
			[ id => ~this.external.indexOf( id ) ? false : null ]
				.concat( this.plugins.map( plugin => plugin.resolveId ).filter( Boolean ) )
				.concat( resolveId )
		);

		this.load = first(
			this.plugins
				.map( plugin => plugin.load )
				.filter( Boolean )
				.concat( load )
		);

		this.transformers = this.plugins
			.map( plugin => plugin.transform )
			.filter( Boolean );

		this.bundleTransformers = this.plugins
			.map( plugin => plugin.transformBundle )
			.filter( Boolean );

		this.moduleById = blank();
		this.modules = [];

		this.externalModules = [];
		this.internalNamespaces = [];

		this.assumedGlobals = blank();

		this.external = ensureArray( options.external ).map( id => id.replace( /[\/\\]/g, '/' ) );
		this.onwarn = options.onwarn || makeOnwarn();

		// TODO strictly speaking, this only applies with non-ES6, non-default-only bundles
		[ 'module', 'exports', '_interopDefault' ].forEach( global => this.assumedGlobals[ global ] = true );
	}

	build () {
		// Phase 1 – discovery. We load the entry module and find which
		// modules it imports, and import those, until we have all
		// of the entry module's dependencies
		return this.resolveId( this.entry, undefined )
			.then( id => this.fetchModule( id, undefined ) )
			.then( entryModule => {
				this.entryModule = entryModule;

				// Phase 2 – binding. We link references to their declarations
				// to generate a complete picture of the bundle
				this.modules.forEach( module => module.bindImportSpecifiers() );
				this.modules.forEach( module => module.bindAliases() );
				this.modules.forEach( module => module.bindReferences() );

				// Phase 3 – marking. We 'run' each statement to see which ones
				// need to be included in the generated bundle

				// mark all export statements
				entryModule.getExports().forEach( name => {
					const declaration = entryModule.traceExport( name );
					declaration.exportName = name;

					declaration.use();
				});

				// mark statements that should appear in the bundle
				let settled = false;
				while ( !settled ) {
					settled = true;

					this.modules.forEach( module => {
						if ( module.run() ) settled = false;
					});
				}

				// Phase 4 – final preparation. We order the modules with an
				// enhanced topological sort that accounts for cycles, then
				// ensure that names are deconflicted throughout the bundle
				this.orderedModules = this.sort();
				this.deconflict();
			});
	}

	deconflict () {
		let used = blank();

		// ensure no conflicts with globals
		keys( this.assumedGlobals ).forEach( name => used[ name ] = 1 );

		function getSafeName ( name ) {
			while ( used[ name ] ) {
				name += `$${used[name]++}`;
			}

			used[ name ] = 1;
			return name;
		}

		this.externalModules.forEach( module => {
			module.name = getSafeName( module.name );

			// ensure we don't shadow named external imports, if
			// we're creating an ES6 bundle
			forOwn( module.declarations, ( declaration, name ) => {
				declaration.setSafeName( getSafeName( name ) );
			});
		});

		this.modules.forEach( module => {
			forOwn( module.declarations, ( declaration, originalName ) => {
				if ( declaration.isGlobal ) return;

				if ( originalName === 'default' ) {
					if ( declaration.original && !declaration.original.isReassigned ) return;
				}

				declaration.name = getSafeName( declaration.name );
			});
		});
	}

	fetchModule ( id, importer ) {
		// short-circuit cycles
		if ( id in this.moduleById ) return null;
		this.moduleById[ id ] = null;

		return this.load( id )
			.catch( err => {
				let msg = `Could not load ${id}`;
				if ( importer ) msg += ` (imported by ${importer})`;

				msg += `: ${err.message}`;
				throw new Error( msg );
			})
			.then( source => transform( source, id, this.transformers ) )
			.then( source => {
				const { code, originalCode, ast, sourceMapChain } = source;

				const module = new Module({ id, code, originalCode, ast, sourceMapChain, bundle: this });

				this.modules.push( module );
				this.moduleById[ id ] = module;

				return this.fetchAllDependencies( module ).then( () => module );
			});
	}

	fetchAllDependencies ( module ) {
		return mapSequence( module.sources, source => {
			return this.resolveId( source, module.id )
				.then( resolvedId => {
					let externalName;
					if ( resolvedId ) {
						// If the `resolvedId` is supposed to be external, make it so.
						externalName = resolvedId.replace( /[\/\\]/g, '/' );
					} else if ( isRelative( source ) ) {
						// This could be an external, relative dependency, based on the current module's parent dir.
						externalName = resolve( module.id, '..', source );
					}
					const forcedExternal = externalName && ~this.external.indexOf( externalName );

					if ( !resolvedId || forcedExternal ) {
						if ( !forcedExternal ) {
							if ( isRelative( source ) ) throw new Error( `Could not resolve ${source} from ${module.id}` );
							if ( !~this.external.indexOf( source ) ) this.onwarn( `Treating '${source}' as external dependency` );
						}
						module.resolvedIds[ source ] = source;

						if ( !this.moduleById[ source ] ) {
							const module = new ExternalModule( source );
							this.externalModules.push( module );
							this.moduleById[ source ] = module;
						}
					}

					else {
						if ( resolvedId === module.id ) {
							throw new Error( `A module cannot import itself (${resolvedId})` );
						}

						module.resolvedIds[ source ] = resolvedId;
						return this.fetchModule( resolvedId, module.id );
					}
				});
		});
	}

	render ( options = {} ) {
		const format = options.format || 'es6';

		// Determine export mode - 'default', 'named', 'none'
		const exportMode = getExportMode( this, options.exports );

		let magicString = new MagicString.Bundle({ separator: '\n\n' });
		let usedModules = [];

		this.orderedModules.forEach( module => {
			const source = module.render( format === 'es6' );
			if ( source.toString().length ) {
				magicString.addSource( source );
				usedModules.push( module );
			}
		});

		const intro = [ options.intro ]
			.concat(
				this.plugins.map( plugin => plugin.intro && plugin.intro() )
			)
			.filter( Boolean )
			.join( '\n\n' );

		if ( intro ) magicString.prepend( intro + '\n' );
		if ( options.outro ) magicString.append( '\n' + options.outro );

		const indentString = getIndentString( magicString, options );

		const finalise = finalisers[ format ];
		if ( !finalise ) throw new Error( `You must specify an output type - valid options are ${keys( finalisers ).join( ', ' )}` );

		magicString = finalise( this, magicString.trim(), { exportMode, indentString }, options );

		const banner = [ options.banner ]
			.concat( this.plugins.map( plugin => plugin.banner ) )
			.map( callIfFunction )
			.filter( Boolean )
			.join( '\n' );

		const footer = [ options.footer ]
			.concat( this.plugins.map( plugin => plugin.footer ) )
			.map( callIfFunction )
			.filter( Boolean )
			.join( '\n' );

		if ( banner ) magicString.prepend( banner + '\n' );
		if ( footer ) magicString.append( '\n' + footer );

		let code = magicString.toString();
		let map = null;
		let bundleSourcemapChain = [];

		code = transformBundle( code, this.bundleTransformers, bundleSourcemapChain )
			.replace( new RegExp( `\\/\\/#\\s+${SOURCEMAPPING_URL}=.+\\n?`, 'g' ), '' );

		if ( options.sourceMap ) {
			let file = options.sourceMapFile || options.dest;
			if ( file ) file = resolve( typeof process !== 'undefined' ? process.cwd() : '', file );

			map = magicString.generateMap({ file, includeContent: true });

			if ( this.transformers.length || this.bundleTransformers.length ) {
				map = collapseSourcemaps( map, usedModules, bundleSourcemapChain );
			}

			map.sources = map.sources.map( unixizePath );
		}

		return { code, map };
	}

	sort () {
		let seen = {};
		let hasCycles;
		let ordered = [];

		let stronglyDependsOn = blank();
		let dependsOn = blank();

		this.modules.forEach( module => {
			stronglyDependsOn[ module.id ] = blank();
			dependsOn[ module.id ] = blank();
		});

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
		});

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
					const b = ordered[i];

					if ( stronglyDependsOn[ a.id ][ b.id ] ) {
						// somewhere, there is a module that imports b before a. Because
						// b imports a, a is placed before b. We need to find the module
						// in question, so we can provide a useful error message
						let parent = '[[unknown]]';

						const findParent = module => {
							if ( dependsOn[ module.id ][ a.id ] && dependsOn[ module.id ][ b.id ] ) {
								parent = module.id;
							} else {
								for ( let i = 0; i < module.dependencies.length; i += 1 ) {
									const dependency = module.dependencies[i];
									if ( findParent( dependency ) ) return;
								}
							}
						};

						findParent( this.entryModule );

						this.onwarn(
							`Module ${a.id} may be unable to evaluate without ${b.id}, but is included first due to a cyclical dependency. Consider swapping the import statements in ${parent} to ensure correct ordering`
						);
					}
				}
			});
		}

		return ordered;
	}
}
