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

		this.globals = new Scope();
		this.scope = new Scope( this.globals );

		this.toExport = null;

		this.pending = blank();
		this.moduleById = blank();
		this.modules = [];

		this.statements = null;
		this.externalModules = [];
		this.internalNamespaceModules = [];

		this.assumedGlobals = blank();
		this.assumedGlobals.exports = true; // TODO strictly speaking, this only applies with non-ES6, non-default-only bundles
	}

	build () {
		return Promise.resolve( this.resolveId( this.entry, undefined, this.resolveOptions ) )
			.then( id => this.fetchModule( id ) )
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
					const definingStatement = module.definitions[ name ];
					const exportDeclaration = module.exports[ name ] || module.reexports[ name ] || (
						module.exports.default && module.exports.default.identifier === name && module.exports.default
					);

					const shouldMark = ( definingStatement && definingStatement.isIncluded ) ||
					                   ( exportDeclaration && exportDeclaration.isUsed );

					if ( shouldMark ) {
						settled = false;
						statement.mark();
						return;
					}

					// special case - https://github.com/rollup/rollup/pull/40
					// TODO refactor this? it's a bit confusing
					const importDeclaration = module.imports[ name ];
					if ( !importDeclaration || importDeclaration.module.isExternal ) return;

					const otherExportDeclaration = importDeclaration.module.exports[ importDeclaration.name ];
					// TODO things like `export default a + b` don't apply here... right?
					const otherDefiningStatement = module.findDefiningStatement( otherExportDeclaration.localName );

					if ( !otherDefiningStatement ) return;

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
		this.toExport = this.entryModule.exports.usedNames();

		let magicString = new MagicString.Bundle({ separator: '\n\n' });

		this.orderedModules.forEach( module => {
			const source = module.render( this.toExport, format );
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

		const exportDelegate = module.exportDelegates[ name ];
		if ( exportDelegate ) return this.traceExport( exportDelegate.module, name, es6 );

		throw new Error( `Could not trace binding '${name}' from ${module.id}` );
	}
}
