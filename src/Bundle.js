import { basename, extname } from './utils/path';
import { Promise } from 'sander';
import MagicString from 'magic-string';
import { blank, keys } from './utils/object';
import Module from './Module';
import ExternalModule from './ExternalModule';
import finalisers from './finalisers/index';
import makeLegalIdentifier from './utils/makeLegalIdentifier';
import ensureArray from './utils/ensureArray';
import { defaultResolver, defaultExternalResolver } from './utils/resolveId';
import { defaultLoader } from './utils/load';
import getExportMode from './utils/getExportMode';
import getIndentString from './utils/getIndentString';
import { unixizePath } from './utils/normalizePlatform.js';

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

		this.toExport = null;

		this.modulePromises = blank();
		this.modules = [];

		this.statements = null;
		this.externalModules = [];
		this.internalNamespaceModules = [];

		this.assumedGlobals = blank();
		this.assumedGlobals.exports = true; // TODO strictly speaking, this only applies with non-ES6, non-default-only bundles
	}

	build () {
		return this.fetchModule( this.entry, undefined )
			.then( entryModule => {
				const defaultExport = entryModule.exports.default;

				this.entryModule = entryModule;

				if ( defaultExport ) {
					entryModule.needsDefault = true;

					// `export default function foo () {...}` -
					// use the declared name for the export
					if ( defaultExport.identifier ) {
						entryModule.suggestName( 'default', defaultExport.identifier );
					}

					// `export default a + b` - generate an export name
					// based on the id of the entry module
					else {
						let defaultExportName = makeLegalIdentifier( basename( this.entryModule.id ).slice( 0, -extname( this.entryModule.id ).length ) );

						// deconflict
						let topLevelNames = [];
						entryModule.statements.forEach( statement => {
							keys( statement.defines ).forEach( name => topLevelNames.push( name ) );
						});

						while ( ~topLevelNames.indexOf( defaultExportName ) ) {
							defaultExportName = `_${defaultExportName}`;
						}

						entryModule.suggestName( 'default', defaultExportName );
					}
				}

				return entryModule.markAllStatements( true );
			})
			.then( () => {
				return this.markAllModifierStatements();
			})
			.then( () => {
				this.orderedModules = this.sort();
			});
	}

	// TODO would be better to deconflict once, rather than per-render
	deconflict ( es6 ) {
		let usedNames = blank();

		// ensure no conflicts with globals
		keys( this.assumedGlobals ).forEach( name => usedNames[ name ] = true );

		let allReplacements = blank();

		// Assign names to external modules
		this.externalModules.forEach( module => {
			// while we're here...
			allReplacements[ module.id ] = blank();

			// TODO is this necessary in the ES6 case?
			let name = makeLegalIdentifier( module.suggestedNames['*'] || module.suggestedNames.default || module.id );
			module.name = getSafeName( name );
		});

		// Discover conflicts (i.e. two statements in separate modules both define `foo`)
		let i = this.orderedModules.length;
		while ( i-- ) {
			const module = this.orderedModules[i];

			// while we're here...
			allReplacements[ module.id ] = blank();

			keys( module.definitions ).forEach( name => {
				const safeName = getSafeName( name );
				if ( safeName !== name ) {
					module.rename( name, safeName );
					allReplacements[ module.id ][ name ] = safeName;
				}
			});
		}

		// Assign non-conflicting names to internal default/namespace export
		this.orderedModules.forEach( module => {
			if ( !module.needsDefault && !module.needsAll ) return;

			if ( module.needsAll ) {
				const namespaceName = getSafeName( module.suggestedNames[ '*' ] );
				module.replacements[ '*' ] = namespaceName;
			}

			if ( module.needsDefault || module.needsAll && module.exports.default ) {
				const defaultExport = module.exports.default;

				// only create a new name if either
				//   a) it's an expression (`export default 42`) or
				//   b) it's a name that is reassigned to (`export var a = 1; a = 2`)
				if ( defaultExport && defaultExport.identifier && !defaultExport.isModified ) return; // TODO encapsulate check for whether we need synthetic default name

				const defaultName = getSafeName( module.suggestedNames.default );
				module.replacements.default = defaultName;
			}
		});

		this.orderedModules.forEach( module => {
			keys( module.imports ).forEach( localName => {
				if ( !module.imports[ localName ].isUsed ) return;

				const bundleName = this.trace( module, localName, es6 );
				if ( bundleName !== localName ) {
					allReplacements[ module.id ][ localName ] = bundleName;
				}
			});
		});

		function getSafeName ( name ) {
			while ( usedNames[ name ] ) {
				name = `_${name}`;
			}

			usedNames[ name ] = true;
			return name;
		}

		return allReplacements;
	}

	fetchModule ( importee, importer ) {
		return Promise.resolve( this.resolveId( importee, importer, this.resolveOptions ) )
			.then( id => {
				if ( !id ) {
					// external module
					if ( !this.modulePromises[ importee ] ) {
						const module = new ExternalModule( importee );
						this.externalModules.push( module );
						this.modulePromises[ importee ] = Promise.resolve( module );
					}

					return this.modulePromises[ importee ];
				}

				if ( id === importer ) {
					throw new Error( `A module cannot import itself (${id})` );
				}

				if ( !this.modulePromises[ id ] ) {
					this.modulePromises[ id ] = Promise.resolve( this.load( id, this.loadOptions ) )
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

							return module;
						});
				}

				return this.modulePromises[ id ];
			});
	}

	markAllModifierStatements () {
		let settled = true;
		let promises = [];

		this.modules.forEach( module => {
			module.statements.forEach( statement => {
				if ( statement.isIncluded ) return;

				keys( statement.modifies ).forEach( name => {
					const definingStatement = module.definitions[ name ];
					const exportDeclaration = module.exports[ name ] || module.reexports[ name ] || (
						module.exports.default && module.exports.default.identifier === name && module.exports.default
					);

					const shouldMark = ( definingStatement && definingStatement.isIncluded ) ||
					                   ( exportDeclaration && exportDeclaration.isUsed );

					if ( shouldMark ) {
						settled = false;
						promises.push( statement.mark() );
						return;
					}

					// special case - https://github.com/rollup/rollup/pull/40
					const importDeclaration = module.imports[ name ];
					if ( !importDeclaration ) return;

					const promise = Promise.resolve( importDeclaration.module || this.fetchModule( importDeclaration.source, module.id ) )
						.then( module => {
							if ( module.isExternal ) return null;

							importDeclaration.module = module;
							const exportDeclaration = module.exports[ importDeclaration.name ];
							// TODO things like `export default a + b` don't apply here... right?
							return module.findDefiningStatement( exportDeclaration.localName );
						})
						.then( definingStatement => {
							if ( !definingStatement ) return;

							settled = false;
							return statement.mark();
						});

					promises.push( promise );
				});
			});
		});

		return Promise.all( promises ).then( () => {
			if ( !settled ) return this.markAllModifierStatements();
		});
	}

	render ( options = {} ) {
		const format = options.format || 'es6';
		const allReplacements = this.deconflict( format === 'es6' );

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
				isReassignedVarDeclaration[ module.replacements[ name ] || name ] = true;
			});
		});

		if ( format !== 'es6' && exportMode === 'named' ) {
			keys( this.entryModule.exports )
				.concat( keys( this.entryModule.reexports ) )
				.forEach( name => {
					const canonicalName = this.traceExport( this.entryModule, name );

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
		this.toExport = keys( this.entryModule.exports )
			.concat( keys( this.entryModule.reexports ) )
			.filter( key => !varExports[ key ] );

		let magicString = new MagicString.Bundle({ separator: '\n\n' });

		this.orderedModules.forEach( module => {
			const source = module.render( allBundleExports, allReplacements[ module.id ], format );
			if ( source.toString().length ) {
				magicString.addSource( source );
			}
		});

		// prepend bundle with internal namespaces
		const indentString = getIndentString( magicString, options );
		const namespaceBlock = this.internalNamespaceModules.map( module => {
			const exports = keys( module.exports )
				.concat( keys( module.reexports ) )
				.map( name => {
					const canonicalName = this.traceExport( module, name );
					return `${indentString}get ${name} () { return ${canonicalName}; }`;
				});

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

	trace ( module, localName, es6 ) {
		const importDeclaration = module.imports[ localName ];

		// defined in this module
		if ( !importDeclaration ) return module.replacements[ localName ] || localName;

		// defined elsewhere
		return this.traceExport( importDeclaration.module, importDeclaration.name, es6 );
	}

	traceExport ( module, name, es6 ) {
		if ( module.isExternal ) {
			if ( name === 'default' ) return module.needsNamed && !es6 ? `${module.name}__default` : module.name;
			if ( name === '*' ) return module.name;
			return es6 ? name : `${module.name}.${name}`;
		}

		const reexportDeclaration = module.reexports[ name ];
		if ( reexportDeclaration ) {
			return this.traceExport( reexportDeclaration.module, reexportDeclaration.localName );
		}

		if ( name === '*' ) return module.replacements[ '*' ];
		if ( name === 'default' ) return module.defaultName();

		const exportDeclaration = module.exports[ name ];
		if ( exportDeclaration ) return this.trace( module, exportDeclaration.localName );

		for ( let i = 0; i < module.exportDelegates.length; i += 1 ) {
			const delegate = module.exportDelegates[i];
			const delegateExportDeclaration = delegate.module.exports[ name ];

			if ( delegateExportDeclaration ) {
				return this.trace( delegate.module, delegateExportDeclaration.localName, es6 );
			}
		}

		throw new Error( `Could not trace binding '${name}' from ${module.id}` );
	}
}
