import Promise from 'es6-promise/lib/es6-promise/promise.js';
import MagicString from 'magic-string';
import first from './utils/first.js';
import { blank, keys } from './utils/object.js';
import Module from './Module.js';
import ExternalModule from './ExternalModule.js';
import finalisers from './finalisers/index.js';
import ensureArray from './utils/ensureArray.js';
import { load, onwarn, resolveId } from './utils/defaults.js';
import getExportMode from './utils/getExportMode.js';
import getIndentString from './utils/getIndentString.js';
import { unixizePath } from './utils/normalizePlatform.js';
import transform from './utils/transform.js';
import collapseSourcemaps from './utils/collapseSourcemaps.js';
import callIfFunction from './utils/callIfFunction.js';
import { isRelative } from './utils/path.js';

export default class Bundle {
	constructor ( options ) {
		this.entry = options.entry;
		this.entryModule = null;

		this.plugins = ensureArray( options.plugins );

		this.resolveId = first(
			this.plugins
				.map( plugin => plugin.resolveId )
				.filter( Boolean )
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

		this.moduleById = blank();
		this.modules = [];

		this.externalModules = [];
		this.internalNamespaces = [];

		this.assumedGlobals = blank();

		this.external = options.external || [];
		this.onwarn = options.onwarn || onwarn;

		// TODO strictly speaking, this only applies with non-ES6, non-default-only bundles
		[ 'module', 'exports' ].forEach( global => this.assumedGlobals[ global ] = true );
	}

	build () {
		// Phase 1 – discovery. We load the entry module and find which
		// modules it imports, and import those, until we have all
		// of the entry module's dependencies
		return Promise.resolve( this.resolveId( this.entry, undefined ) )
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
					declaration.isExported = true;

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
		});

		this.modules.forEach( module => {
			keys( module.declarations ).forEach( originalName => {
				const declaration = module.declarations[ originalName ];

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

		return Promise.resolve( this.load( id ) )
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
		const promises = module.dependencies.map( source => {
			return Promise.resolve( this.resolveId( source, module.id ) )
				.then( resolvedId => {
					if ( !resolvedId ) {
						if ( isRelative( source ) ) throw new Error( `Could not resolve ${source} from ${module.id}` );
						if ( !~this.external.indexOf( source ) ) this.onwarn( `Treating '${source}' as external dependency` );
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

		return Promise.all( promises );
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

		const code = magicString.toString();
		let map = null;

		if ( options.sourceMap ) {
			const file = options.sourceMapFile || options.dest;
			map = magicString.generateMap({
				includeContent: true,
				file
				// TODO
			});

			if ( this.transformers.length ) map = collapseSourcemaps( map, usedModules );
			map.sources = map.sources.map( unixizePath );
		}

		return { code, map };
	}

	sort () {
		let seen = {};
		let ordered = [];
		let hasCycles;

		let strongDeps = {};
		let stronglyDependsOn = {};

		function visit ( module ) {
			if ( seen[ module.id ] ) return;
			seen[ module.id ] = true;

			const { strongDependencies, weakDependencies } = module.consolidateDependencies();

			strongDeps[ module.id ] = [];
			stronglyDependsOn[ module.id ] = {};

			strongDependencies.forEach( imported => {
				strongDeps[ module.id ].push( imported );

				if ( seen[ imported.id ] ) {
					// we need to prevent an infinite loop, and note that
					// we need to check for strong/weak dependency relationships
					hasCycles = true;
					return;
				}

				visit( imported );
			});

			weakDependencies.forEach( imported => {
				if ( seen[ imported.id ] ) {
					// we need to prevent an infinite loop, and note that
					// we need to check for strong/weak dependency relationships
					hasCycles = true;
					return;
				}

				visit( imported );
			});

			// add second (and third...) order dependencies
			function addStrongDependencies ( dependency ) {
				if ( stronglyDependsOn[ module.id ][ dependency.id ] ) return;

				stronglyDependsOn[ module.id ][ dependency.id ] = true;
				strongDeps[ dependency.id ].forEach( addStrongDependencies );
			}

			strongDeps[ module.id ].forEach( addStrongDependencies );

			ordered.push( module );
		}

		this.modules.forEach( visit );

		if ( hasCycles ) {
			let unordered = ordered;
			ordered = [];

			// unordered is actually semi-ordered, as [ fewer dependencies ... more dependencies ]
			unordered.forEach( module => {
				// ensure strong dependencies of `module` that don't strongly depend on `module` go first
				strongDeps[ module.id ].forEach( place );

				function place ( dep ) {
					if ( !stronglyDependsOn[ dep.id ][ module.id ] && !~ordered.indexOf( dep ) ) {
						strongDeps[ dep.id ].forEach( place );
						ordered.push( dep );
					}
				}

				if ( !~ordered.indexOf( module ) ) {
					ordered.push( module );
				}
			});
		}

		return ordered;
	}
}
