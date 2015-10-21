import Promise from 'es6-promise/lib/es6-promise/promise';
import MagicString from 'magic-string';
import first from './utils/first.js';
import { blank, keys } from './utils/object';
import Module from './Module';
import ExternalModule from './ExternalModule';
import finalisers from './finalisers/index';
import ensureArray from './utils/ensureArray';
import { defaultResolver, defaultExternalResolver } from './utils/resolveId';
import { defaultLoader } from './utils/load';
import getExportMode from './utils/getExportMode';
import getIndentString from './utils/getIndentString';
import { unixizePath } from './utils/normalizePlatform.js';
import transform from './utils/transform';
import collapseSourcemaps from './utils/collapseSourcemaps';

export default class Bundle {
	constructor ( options ) {
		this.entry = options.entry;
		this.entryModule = null;

		this.resolveId = first( ensureArray( options.resolveId ).concat( defaultResolver ) );
		this.load = first( ensureArray( options.load ).concat( defaultLoader ) );

		this.resolveOptions = {
			external: ensureArray( options.external ),
			resolveExternal: first( ensureArray( options.resolveExternal ).concat( defaultExternalResolver ) )
		};

		this.loadOptions = {};
		this.transformers = ensureArray( options.transform );

		this.pending = blank();
		this.moduleById = blank();
		this.modules = [];

		this.externalModules = [];
		this.internalNamespaces = [];

		this.assumedGlobals = blank();

		// TODO strictly speaking, this only applies with non-ES6, non-default-only bundles
		[ 'module', 'exports' ].forEach( global => this.assumedGlobals[ global ] = true );
	}

	build () {
		return Promise.resolve( this.resolveId( this.entry, undefined, this.resolveOptions ) )
			.then( id => this.fetchModule( id ) )
			.then( entryModule => {
				this.entryModule = entryModule;

				this.modules.forEach( module => module.bindImportSpecifiers() );
				this.modules.forEach( module => module.bindAliases() );
				this.modules.forEach( module => module.bindReferences() );

				// mark all export statements
				entryModule.getExports().forEach( name => {
					const declaration = entryModule.traceExport( name );
					declaration.isExported = true;

					declaration.use();
				});

				let settled = false;
				while ( !settled ) {
					settled = true;

					this.modules.forEach( module => {
						if ( module.markAllSideEffects() ) settled = false;
					});
				}

				this.orderedModules = this.sort();
				this.deconflict();
			});
	}

	deconflict () {
		let used = blank();

		// ensure no conflicts with globals
		keys( this.assumedGlobals ).forEach( name => used[ name ] = 1 );

		function getSafeName ( name ) {
			if ( used[ name ] ) {
				return `${name}$${used[name]++}`;
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

	fetchModule ( id ) {
		// short-circuit cycles
		if ( this.pending[ id ] ) return null;
		this.pending[ id ] = true;

		return Promise.resolve( this.load( id, this.loadOptions ) )
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
			return Promise.resolve( this.resolveId( source, module.id, this.resolveOptions ) )
				.then( resolvedId => {
					module.resolvedIds[ source ] = resolvedId || source;

					// external module
					if ( !resolvedId ) {
						if ( !this.moduleById[ source ] ) {
							const module = new ExternalModule( source );
							this.externalModules.push( module );
							this.moduleById[ source ] = module;
						}
					}

					else if ( resolvedId === module.id ) {
						throw new Error( `A module cannot import itself (${resolvedId})` );
					}

					else {
						return this.fetchModule( resolvedId );
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

		if ( options.intro ) magicString.prepend( options.intro + '\n' );
		if ( options.outro ) magicString.append( '\n' + options.outro );

		const indentString = getIndentString( magicString, options );

		const finalise = finalisers[ format ];
		if ( !finalise ) throw new Error( `You must specify an output type - valid options are ${keys( finalisers ).join( ', ' )}` );

		magicString = finalise( this, magicString.trim(), { exportMode, indentString }, options );

		if ( options.banner ) magicString.prepend( options.banner + '\n' );
		if ( options.footer ) magicString.append( '\n' + options.footer );

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

			keys( strongDependencies ).forEach( id => {
				const imported = strongDependencies[ id ];

				strongDeps[ module.id ].push( imported );

				if ( seen[ id ] ) {
					// we need to prevent an infinite loop, and note that
					// we need to check for strong/weak dependency relationships
					hasCycles = true;
					return;
				}

				visit( imported );
			});

			keys( weakDependencies ).forEach( id => {
				const imported = weakDependencies[ id ];

				if ( seen[ id ] ) {
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
