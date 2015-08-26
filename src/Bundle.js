import { Promise } from 'sander';
import MagicString from 'magic-string';
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
import Scope from './Scope';

export default class Bundle {
	constructor ( options ) {
		this.entry = options.entry;
		this.entryModule = null;

		this.resolveId = options.resolveId || defaultResolver;
		this.load = options.load || defaultLoader;

		this.resolveOptions = {
			external: ensureArray( options.external ),
			resolveExternal: options.resolveExternal || defaultExternalResolver
		};

		this.loadOptions = {
			transform: ensureArray( options.transform )
		};

		// The global scope, and the bundle's internal scope.
		this.globals = new Scope();
		this.scope = new Scope( this.globals );

		// TODO strictly speaking, this only applies with non-ES6, non-default-only bundles
		// However, the deconfliction logic is greatly simplified by being the same for all formats.
		this.globals.define( 'exports' );
		this.scope.bind( 'exports', this.globals.reference( 'exports' ) );

		// Alias for entryModule.exports.
		this.exports = null;

		this.toExport = null;

		this.pending = blank();
		this.moduleById = blank();
		this.modules = [];

		this.statements = null;
		this.externalModules = [];
		this.internalNamespaceModules = [];
	}

	build () {
		return Promise.resolve( this.resolveId( this.entry, undefined, this.resolveOptions ) )
			.then( id => this.fetchModule( id ) )
			.then( entryModule => {
				this.entryModule = entryModule;
				this.exports = entryModule.exports;

				entryModule.markAllStatements( true );
				this.markAllModifierStatements();
				this.orderedModules = this.sort();

				// As a last step, deconflict all identifier names, once.
				this.scope.deconflict();
			});
	}

	fetchModule ( id ) {
		// short-circuit cycles
		if ( this.pending[ id ] ) return null;
		this.pending[ id ] = true;

		return Promise.resolve( this.load( id, this.loadOptions ) )
			.then( source => {
				let ast;

				if ( typeof source === 'object' ) {
					ast = source.ast;
					source = source.code;
				}

				const module = new Module({
					id,
					source,
					ast,
					bundle: this
				});

				this.modules.push( module );
				this.moduleById[ id ] = module;

				return this.fetchAllDependencies( module ).then( () => {
					// Analyze the module once all its dependencies have been resolved.
					// This means that any dependencies of a module has already been
					// analysed when it's time for the module itself.
					//
					// FIXME: Except for cyclic dependencies...
					module.analyse();
					return module;
				});
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
							const module = new ExternalModule( { id: source, bundle: this } );
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

	markAllModifierStatements () {
		let settled = true;

		this.modules.forEach( module => {
			module.statements.forEach( statement => {
				if ( statement.isIncluded ) return;

				keys( statement.modifies ).forEach( name => {
					const local = module.locals.lookup( name );
					const exported = module.exports.lookup( name );

					if ( local && local.module === module || exported && exported.isUsed ) {
						settled = false;
						statement.mark();
						return;
					}

					// special case - https://github.com/rollup/rollup/pull/40
					// TODO refactor this? it's a bit confusing
					// TODO things like `export default a + b` don't apply here... right?
					if ( !local || !local.statement || !local.module || local.module.isExternal ) return;

					settled = false;
					statement.mark();
				});
			});
		});

		if ( !settled ) this.markAllModifierStatements();
	}

	render ( options = {} ) {
		const format = options.format || 'es6';

		// Determine export mode - 'default', 'named', 'none'
		const exportMode = getExportMode( this, options.exports );

		// If we have named exports from the bundle, and those exports
		// are assigned to *within* the bundle, we may need to rewrite e.g.
		//
		//   export let count = 0;
		//   export function incr () { count++ }
		//
		// might become...
		//
		//   exports.count = 0;
		//   function incr () {
		//     exports.count += 1;
		//   }
		//   exports.incr = incr;
		//
		// This doesn't apply if the bundle is exported as ES6!
		let allBundleExports = blank();
		let isReassignedVarDeclaration = blank();
		let varExports = blank();
		let getterExports = [];

		this.orderedModules.forEach( module => {
			module.reassignments.forEach( name => {
				isReassignedVarDeclaration[ module.exports.lookup( name ) ] = true;
			});
		});

		if ( format !== 'es6' && exportMode === 'named' ) {
			keys( this.exports.names )
				.forEach( name => {
					const canonicalName = this.exports.lookup( name ).name;

					if ( isReassignedVarDeclaration[ canonicalName ] ) {
						varExports[ name ] = true;

						// if the same binding is exported multiple ways, we need to
						// use getters to keep all exports in sync
						if ( allBundleExports[ canonicalName ] ) {
							getterExports.push({ key: name, value: allBundleExports[ canonicalName ] });
						} else {
							allBundleExports[ canonicalName ] = `exports.${name}`;
						}
					}
				});
		}

		// since we're rewriting variable exports, we want to
		// ensure we don't try and export them again at the bottom
		this.toExport = keys( this.exports.names )
			.filter( key => !varExports[ key ] );

		let magicString = new MagicString.Bundle({ separator: '\n\n' });

		this.orderedModules.forEach( module => {
			const source = module.render( allBundleExports, format === 'es6' );
			if ( source.toString().length ) {
				magicString.addSource( source );
			}
		});

		// prepend bundle with internal namespaces
		const indentString = getIndentString( magicString, options );

		const namespaceBlock = this.internalNamespaceModules.map( module => {
			const exports = module.exports.localIds().map( ( [ name, id ] ) =>
				`${indentString}get ${name} () { return ${id.name}; }`);

			return `var ${module.replacements['*']} = {\n` +
				exports.join( ',\n' ) +
			`\n};\n\n`;
		}).join( '' );

		magicString.prepend( namespaceBlock );

		if ( getterExports.length ) {
			// TODO offer ES3-safe (but not spec-compliant) alternative?
			const getterExportsBlock = `Object.defineProperties(exports, {\n` +
				getterExports.map( ({ key, value }) => indentString + `${key}: { get: function () { return ${value}; } }` ).join( ',\n' ) +
			`\n});`;

			magicString.append( '\n\n' + getterExportsBlock );
		}

		const finalise = finalisers[ format ];

		if ( !finalise ) {
			throw new Error( `You must specify an output type - valid options are ${keys( finalisers ).join( ', ' )}` );
		}

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

		visit( this.entryModule );

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
