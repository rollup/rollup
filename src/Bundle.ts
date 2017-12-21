import { timeStart, timeEnd } from './utils/flushTime';
import { decode } from 'sourcemap-codec';
import { Bundle as MagicStringBundle } from 'magic-string';
import first from './utils/first';
import { find } from './utils/array';
import { blank, forOwn, keys } from './utils/object';
import Module from './Module';
import ExternalModule from './ExternalModule';
import finalisers from './finalisers/index';
import ensureArray from './utils/ensureArray';
import { load, makeOnwarn, resolveId } from './utils/defaults';
import getExportMode from './utils/getExportMode';
import getIndentString from './utils/getIndentString';
import { mapSequence, runSequence } from './utils/promise';
import transform from './utils/transform';
import transformBundle from './utils/transformBundle';
import collapseSourcemaps from './utils/collapseSourcemaps';
import callIfFunction from './utils/callIfFunction';
import relativeId from './utils/relativeId';
import error from './utils/error';
import {
	dirname,
	isRelative,
	isAbsolute,
	normalize,
	relative,
	resolve
} from './utils/path';
import BundleScope from './ast/scopes/BundleScope';
import {
	OutputOptions, WarningHandler, TreeshakingOptions, Plugin, ResolveIdHook, IsExternalHook, InputOptions, Warning
} from './rollup/index';
import NamespaceVariable from './ast/variables/NamespaceVariable';
import ExternalVariable from './ast/variables/ExternalVariable';
import { RawSourceMap } from 'source-map';

export type SourceDescription = { code: string, map?: RawSourceMap, ast?: Node };

export default class Bundle {
	acornOptions: any;
	cachedModules: Map<string, Module>;
	context: string;
	entry: string;
	entryId: string;
	externalModules: ExternalModule[];
	entryModule: Module;
	getModuleContext: (id: string) => string;
	hasLoaders: boolean;
	isExternal: IsExternalHook;
	isPureExternalModule: (id: string) => boolean;
	legacy: boolean;
	load: (id: string) => Promise<SourceDescription>;
	moduleById: Map<string, Module | ExternalModule>;
	modules: Module[];
	onwarn: WarningHandler;
	orderedModules: Module[];
	plugins: Plugin[];
	resolveId: (id: string, parent: string) => Promise<string | boolean | void>;
	scope: BundleScope;
	treeshakingOptions: TreeshakingOptions;
	varOrConst: 'var' | 'const';

	// deprecated
	treeshake: boolean;

	constructor (options: InputOptions) {
		this.cachedModules = new Map();
		if (options.cache) {
			options.cache.modules.forEach(module => {
				this.cachedModules.set(module.id, module);
			});
		}
		delete options.cache; // TODO not deleting it here causes a memory leak; needs further investigation

		this.plugins = ensureArray(options.plugins);

		options = this.plugins.reduce((acc, plugin) => {
			if (plugin.options) return plugin.options(acc) || acc;
			return acc;
		}, options);

		if (!options.input) {
			throw new Error('You must supply options.input to rollup');
		}

		this.entry = options.input;
		this.entryId = null;
		this.entryModule = null;

		this.treeshake = options.treeshake !== false;
		if (this.treeshake) {
			this.treeshakingOptions = {
				propertyReadSideEffects: options.treeshake
					? (<TreeshakingOptions>options.treeshake).propertyReadSideEffects !== false
					: true,
				pureExternalModules: options.treeshake
					? (<TreeshakingOptions>options.treeshake).pureExternalModules
					: false
			};
			if (this.treeshakingOptions.pureExternalModules === true) {
				this.isPureExternalModule = () => true;
			} else if (
				typeof this.treeshakingOptions.pureExternalModules === 'function'
			) {
				this.isPureExternalModule = this.treeshakingOptions.pureExternalModules;
			} else if (Array.isArray(this.treeshakingOptions.pureExternalModules)) {
				const pureExternalModules = new Set(
					this.treeshakingOptions.pureExternalModules
				);
				this.isPureExternalModule = id => pureExternalModules.has(id);
			} else {
				this.isPureExternalModule = () => false;
			}
		} else {
			this.isPureExternalModule = () => false;
		}

		this.resolveId = first(
			[((id: string, parentId: string) => (this.isExternal(id, parentId, false) ? false : null)) as ResolveIdHook]
				.concat(this.plugins.map(plugin => plugin.resolveId).filter(Boolean))
				.concat(resolveId)
		);

		const loaders = this.plugins.map(plugin => plugin.load).filter(Boolean);
		this.hasLoaders = loaders.length !== 0;
		this.load = first(loaders.concat(load));

		this.scope = new BundleScope();
		// TODO strictly speaking, this only applies with non-ES6, non-default-only bundles
		['module', 'exports', '_interopDefault'].forEach(name => {
			this.scope.findVariable(name); // creates global variable as side-effect
		});

		this.moduleById = new Map();
		this.modules = [];
		this.externalModules = [];

		this.context = String(options.context);

		const optionsModuleContext = options.moduleContext;
		if (typeof optionsModuleContext === 'function') {
			this.getModuleContext = id => optionsModuleContext(id) || this.context;
		} else if (typeof optionsModuleContext === 'object') {
			const moduleContext = new Map();
			Object.keys(optionsModuleContext).forEach(key => moduleContext.set(resolve(key), optionsModuleContext[key]));
			this.getModuleContext = id => moduleContext.get(id) || this.context;
		} else {
			this.getModuleContext = () => this.context;
		}

		if (typeof options.external === 'function') {
			this.isExternal = options.external;
		} else {
			const ids = ensureArray(options.external);
			this.isExternal = id => ids.indexOf(id) !== -1;
		}

		this.onwarn = options.onwarn || makeOnwarn();

		this.varOrConst = options.preferConst ? 'const' : 'var';
		this.legacy = options.legacy;
		this.acornOptions = options.acorn || {};
		this.dynamicImport = typeof options.experimentalDynamicImport === 'boolean' ? options.experimentalDynamicImport : false;

		if (this.dynamicImport) {
			this.resolveDynamicImport = first(this.plugins.map(plugin => plugin.resolveDynamicImport).filter(Boolean));
			this.acornOptions.plugins = this.acornOptions.plugins || {};
			this.acornOptions.plugins.dynamicImport = true;
		}
	}

	collectAddon (initialAddon: string, addonName: string, sep: string = '\n') {
		return runSequence(
			[{ pluginName: 'rollup', source: initialAddon }]
				.concat(
					this.plugins.map((plugin, idx) => {
						return {
							pluginName: plugin.name || `Plugin at pos ${idx}`,
							source: plugin[addonName]
						};
					})
				)
				.map(addon => {
					addon.source = callIfFunction(addon.source);
					return addon;
				})
				.filter(addon => {
					return addon.source;
				})
				.map(({ pluginName, source }) => {
					return Promise.resolve(source).catch(err => {
						error({
							code: 'ADDON_ERROR',
							message: `Could not retrieve ${addonName}. Check configuration of ${pluginName}.
	Error Message: ${err.message}`
						});
					});
				})
		).then(addons => addons.filter(Boolean).join(sep));
	}

	build () {
		// Phase 1 – discovery. We load the entry module and find which
		// modules it imports, and import those, until we have all
		// of the entry module's dependencies
		return this.resolveId(this.entry, undefined)
			.then(id => {
				if (id === false) {
					error({
						code: 'UNRESOLVED_ENTRY',
						message: `Entry module cannot be external`
					});
				}

				if (id == null) {
					error({
						code: 'UNRESOLVED_ENTRY',
						message: `Could not resolve entry (${this.entry})`
					});
				}

				this.entryId = <string> id;
				return this.fetchModule(this.entryId, undefined);
			})
			.then(entryModule => {
				this.entryModule = entryModule;

				// Phase 2 – binding. We link references to their variables
				// to generate a complete picture of the bundle

				timeStart('phase 2');

				this.modules.forEach(module => module.bindImportSpecifiers());
				this.modules.forEach(module => module.bindReferences());

				// hook dynamic imports
				if (this.dynamicImport)
					return Promise.all(this.modules.map(module => module.processDynamicImports(this.resolveDynamicImport)));
			})
			.then(() => {
				timeEnd('phase 2');

				// Phase 3 – marking. We include all statements that should be included

				timeStart('phase 3');

				// mark all export statements
				this.entryModule.getExports().forEach(name => {
					const variable = this.entryModule.traceExport(name);

					variable.exportName = name;
					variable.includeVariable();

					if (variable.isNamespace) {
						(<NamespaceVariable> variable).needsNamespaceBlock = true;
					}
				});

				this.entryModule.getReexports().forEach(name => {
					const variable = this.entryModule.traceExport(name);

					if (variable.isExternal) {
						variable.reexported = (<ExternalVariable> variable).module.reexported = true;
					} else {
						variable.exportName = name;
						variable.includeVariable();
					}
				});

				// mark statements that should appear in the bundle
				if (this.treeshake) {
					let addedNewNodes;
					do {
						addedNewNodes = false;
						this.modules.forEach(module => {
							if (module.includeInBundle()) {
								addedNewNodes = true;
							}
						});
					} while (addedNewNodes);
				} else {
					// Necessary to properly replace namespace imports
					this.modules.forEach(module => module.includeAllInBundle());
				}

				timeEnd('phase 3');

				// Phase 4 – final preparation. We order the modules with an
				// enhanced topological sort that accounts for cycles, then
				// ensure that names are deconflicted throughout the bundle

				timeStart('phase 4');

				// while we're here, check for unused external imports
				this.externalModules.forEach(module => {
					const unused = Object.keys(module.declarations)
						.filter(name => name !== '*')
						.filter(
							name =>
								!module.declarations[name].included &&
								!module.declarations[name].reexported
						);

					if (unused.length === 0) return;

					const names =
						unused.length === 1
							? `'${unused[0]}' is`
							: `${unused
							.slice(0, -1)
							.map(name => `'${name}'`)
							.join(', ')} and '${unused.slice(-1)}' are`;

					this.warn({
						code: 'UNUSED_EXTERNAL_IMPORT',
						source: module.id,
						names: unused,
						message: `${names} imported from external module '${
							module.id
							}' but never used`
					});
				});

				// prune unused external imports
				this.externalModules = this.externalModules.filter(module => {
					return module.used || !this.isPureExternalModule(module.id);
				});

				this.orderedModules = this.sort();
				this.deconflict();

				timeEnd('phase 4');
			});
	}

	deconflict () {
		const used = blank();

		// ensure no conflicts with globals
		keys(this.scope.variables).forEach(name => (used[name] = 1));

		function getSafeName (name: string): string {
			while (used[name]) {
				name += `$${used[name]++}`;
			}

			used[name] = 1;
			return name;
		}

		const toDeshadow: Set<string> = new Set();

		this.externalModules.forEach(module => {
			const safeName = getSafeName(module.name);
			toDeshadow.add(safeName);
			module.name = safeName;

			// ensure we don't shadow named external imports, if
			// we're creating an ES6 bundle
			forOwn(module.declarations, (declaration, name) => {
				const safeName = getSafeName(name);
				toDeshadow.add(safeName);
				declaration.setSafeName(safeName);
			});
		});

		this.modules.forEach(module => {
			forOwn(module.scope.variables, variable => {
				if (!variable.isDefault || !variable.hasId) {
					variable.name = getSafeName(variable.name);
				}
			});

			// deconflict reified namespaces
			const namespace = module.namespace();
			if (namespace.needsNamespaceBlock) {
				namespace.name = getSafeName(namespace.name);
			}
		});

		this.scope.deshadow(toDeshadow);
	}

	fetchModule (id: string, importer: string): Promise<Module> {
		// short-circuit cycles
		if (this.moduleById.has(id)) return null;
		this.moduleById.set(id, null);

		return this.load(id)
			.catch((err: Error) => {
				let msg = `Could not load ${id}`;
				if (importer) msg += ` (imported by ${importer})`;

				msg += `: ${err.message}`;
				throw new Error(msg);
			})
			.then(source => {
				if (typeof source === 'string') return source;
				if (source && typeof source === 'object' && source.code) return source;

				// TODO report which plugin failed
				error({
					code: 'BAD_LOADER',
					message: `Error loading ${relativeId(
						id
					)}: plugin load hook should return a string, a { code, map } object, or nothing/null`
				});
			})
			.then(source => {
				if (typeof source === 'string') {
					source = {
						code: source,
						ast: null
					};
				}

				if (
					this.cachedModules.has(id) &&
					this.cachedModules.get(id).originalCode === source.code
				) {
					return this.cachedModules.get(id);
				}

				return transform(this, source, id, this.plugins);
			})
			.then(source => {
				const {
					code,
					originalCode,
					originalSourcemap,
					ast,
					sourcemapChain,
					resolvedIds
				} = source;

				const module: Module = new Module({
					id,
					code,
					originalCode,
					originalSourcemap,
					ast,
					sourcemapChain,
					resolvedIds,
					bundle: this
				});

				this.modules.push(module);
				this.moduleById.set(id, module);

				return this.fetchAllDependencies(module).then(() => {
					keys(module.exports).forEach(name => {
						if (name !== 'default') {
							module.exportsAll[name] = module.id;
						}
					});
					module.exportAllSources.forEach(source => {
						const id =
							module.resolvedIds[source] || module.resolvedExternalIds[source];
						const exportAllModule = this.moduleById.get(id);
						if (exportAllModule.isExternal) return;

						keys((<Module> exportAllModule).exportsAll).forEach(name => {
							if (name in module.exportsAll) {
								this.warn({
									code: 'NAMESPACE_CONFLICT',
									reexporter: module.id,
									name,
									sources: [
										module.exportsAll[name],
										(<Module> exportAllModule).exportsAll[name]
									],
									message: `Conflicting namespaces: ${relativeId(
										module.id
									)} re-exports '${name}' from both ${relativeId(
										module.exportsAll[name]
									)} and ${relativeId(
										(<Module> exportAllModule).exportsAll[name]
									)} (will be ignored)`
								});
							} else {
								module.exportsAll[name] = (<Module> exportAllModule).exportsAll[name];
							}
						});
					});
					return module;
				});
			});
	}

	fetchAllDependencies (module: Module) {
		return mapSequence(module.sources, source => {
			const resolvedId = module.resolvedIds[source];
			return (resolvedId
					? Promise.resolve(resolvedId)
					: this.resolveId(source, module.id)
			).then(resolvedId => {
				const externalId =
					resolvedId ||
					(isRelative(source) ? resolve(module.id, '..', source) : source);
				let isExternal = this.isExternal(externalId, module.id, true);

				if (!resolvedId && !isExternal) {
					if (isRelative(source)) {
						error({
							code: 'UNRESOLVED_IMPORT',
							message: `Could not resolve '${source}' from ${relativeId(
								module.id
							)}`
						});
					}

					this.warn({
						code: 'UNRESOLVED_IMPORT',
						source,
						importer: relativeId(module.id),
						message: `'${source}' is imported by ${relativeId(
							module.id
						)}, but could not be resolved – treating it as an external dependency`,
						url:
							'https://github.com/rollup/rollup/wiki/Troubleshooting#treating-module-as-external-dependency'
					});
					isExternal = true;
				}

				if (isExternal) {
					module.resolvedExternalIds[source] = externalId;

					if (!this.moduleById.has(externalId)) {
						const module = new ExternalModule(externalId);
						this.externalModules.push(module);
						this.moduleById.set(externalId, module);
					}

					const externalModule = this.moduleById.get(externalId);

					// add external declarations so we can detect which are never used
					Object.keys(module.imports).forEach(name => {
						const importDeclaration = module.imports[name];
						if (importDeclaration.source !== source) return;

						externalModule.traceExport(importDeclaration.name);
					});
				} else {
					module.resolvedIds[source] = <string> resolvedId;
					return this.fetchModule(<string> resolvedId, module.id);
				}
			});
		});
	}

	getPathRelativeToEntryDirname (resolvedId: string): string {
		if (isRelative(resolvedId) || isAbsolute(resolvedId)) {
			const entryDirname = dirname(this.entryId);
			const relativeToEntry = normalize(relative(entryDirname, resolvedId));

			return isRelative(relativeToEntry)
				? relativeToEntry
				: `./${relativeToEntry}`;
		}

		return resolvedId;
	}

	render (options: OutputOptions) {
		return Promise.resolve()
			.then(() => {
				return Promise.all([
					this.collectAddon(options.banner, 'banner'),
					this.collectAddon(options.footer, 'footer'),
					this.collectAddon(options.intro, 'intro', '\n\n'),
					this.collectAddon(options.outro, 'outro', '\n\n')
				]);
			})
			.then(([banner, footer, intro, outro]) => {
				// Determine export mode - 'default', 'named', 'none'
				const exportMode = getExportMode(this, options);

				let magicString = new MagicStringBundle({ separator: '\n\n' });
				const usedModules: Module[] = [];

				timeStart('render modules');

				this.orderedModules.forEach(module => {
					const source = module.render(
						options.format === 'es',
						this.legacy,
						options.freeze !== false
					);
					if (source.toString().length) {
						magicString.addSource(source);
						usedModules.push(module);
					}
				});

				if (
					!magicString.toString().trim() &&
					this.entryModule.getExports().length === 0 &&
					this.entryModule.getReexports().length === 0
				) {
					this.warn({
						code: 'EMPTY_BUNDLE',
						message: 'Generated an empty bundle'
					});
				}

				timeEnd('render modules');

				const indentString = getIndentString(magicString, options);

				const finalise = finalisers[options.format];
				if (!finalise) {
					error({
						code: 'INVALID_OPTION',
						message: `Invalid format: ${
							options.format
							} - valid options are ${keys(finalisers).join(', ')}`
					});
				}

				timeStart('render format');

				const optionsPaths = options.paths;
				const getPath =
					typeof optionsPaths === 'function'
						? id => optionsPaths(id) || this.getPathRelativeToEntryDirname(id)
						: optionsPaths
						? id =>
							optionsPaths.hasOwnProperty(id)
								? optionsPaths[id]
								: this.getPathRelativeToEntryDirname(id)
						: id => this.getPathRelativeToEntryDirname(id);

				if (intro) intro += '\n\n';
				if (outro) outro = `\n\n${outro}`;

				magicString = finalise(
					this,
					magicString.trim(),
					{ exportMode, getPath, indentString, intro, outro },
					options
				);

				timeEnd('render format');

				if (banner) magicString.prepend(banner + '\n');
				if (footer) magicString.append('\n' + footer);

				const prevCode = magicString.toString();
				let map = null;
				const bundleSourcemapChain: RawSourceMap[] = [];

				return transformBundle(
					prevCode,
					this.plugins,
					bundleSourcemapChain,
					options
				).then(code => {
					if (options.sourcemap) {
						timeStart('sourcemap');

						let file = options.sourcemapFile || options.file;
						if (file)
							file = resolve(
								typeof process !== 'undefined' ? process.cwd() : '',
								file
							);

						if (
							this.hasLoaders ||
							find(
								this.plugins,
								plugin => plugin.transform || plugin.transformBundle
							)
						) {
							map = magicString.generateMap({});
							if (typeof map.mappings === 'string') {
								map.mappings = decode(map.mappings);
							}
							map = collapseSourcemaps(
								this,
								file,
								map,
								usedModules,
								bundleSourcemapChain
							);
						} else {
							map = magicString.generateMap({ file, includeContent: true });
						}

						map.sources = map.sources.map(normalize);

						timeEnd('sourcemap');
					}

					if (code[code.length - 1] !== '\n') code += '\n';
					return { code, map };
				});
			});
	}

	sort () {
		let hasCycles;
		const seen: {[id: string]: boolean} = {};
		const ordered: Module[] = [];

		const stronglyDependsOn = blank();
		const dependsOn = blank();

		this.modules.forEach(module => {
			stronglyDependsOn[module.id] = blank();
			dependsOn[module.id] = blank();
		});

		this.modules.forEach(module => {
			function processStrongDependency (dependency: Module) {
				if (
					dependency === module ||
					stronglyDependsOn[module.id][dependency.id]
				)
					return;

				stronglyDependsOn[module.id][dependency.id] = true;
				dependency.strongDependencies.forEach(processStrongDependency);
			}

			function processDependency (dependency: Module) {
				if (dependency === module || dependsOn[module.id][dependency.id])
					return;

				dependsOn[module.id][dependency.id] = true;
				dependency.dependencies.forEach(processDependency);
			}

			module.strongDependencies.forEach(processStrongDependency);
			module.dependencies.forEach(processDependency);
		});

		const visit = (module: Module) => {
			if (seen[module.id]) {
				hasCycles = true;
				return;
			}

			seen[module.id] = true;

			module.dependencies.forEach(visit);
			ordered.push(module);
		};

		visit(this.entryModule);

		if (hasCycles) {
			ordered.forEach((a, i) => {
				for (i += 1; i < ordered.length; i += 1) {
					const b = ordered[i];

					// TODO reinstate this! it no longer works
					if (stronglyDependsOn[a.id][b.id]) {
						// somewhere, there is a module that imports b before a. Because
						// b imports a, a is placed before b. We need to find the module
						// in question, so we can provide a useful error message
						let parent = '[[unknown]]';
						const visited: {[id: string]: boolean} = {};

						const findParent = (module: Module) => {
							if (dependsOn[module.id][a.id] && dependsOn[module.id][b.id]) {
								parent = module.id;
								return true;
							}
							visited[module.id] = true;
							for (let i = 0; i < module.dependencies.length; i += 1) {
								const dependency = module.dependencies[i];
								if (!visited[dependency.id] && findParent(dependency))
									return true;
							}
						};

						findParent(this.entryModule);

						this.onwarn(
							<any> `Module ${a.id} may be unable to evaluate without ${
								b.id
								}, but is included first due to a cyclical dependency. Consider swapping the import statements in ${parent} to ensure correct ordering`
						);
					}
				}
			});
		}

		return ordered;
	}

	warn (warning: Warning) {
		warning.toString = () => {
			let str = '';

			if (warning.plugin) str += `(${warning.plugin} plugin) `;
			if (warning.loc)
				str += `${relativeId(warning.loc.file)} (${warning.loc.line}:${
					warning.loc.column
					}) `;
			str += warning.message;

			return str;
		};

		this.onwarn(warning);
	}
}
