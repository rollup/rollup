import * as acorn from 'acorn';
import injectDynamicImportPlugin from 'acorn-dynamic-import';
import injectImportMeta from 'acorn-import-meta';
import * as ESTree from 'estree';
import GlobalScope from './ast/scopes/GlobalScope';
import { EntityPathTracker } from './ast/utils/EntityPathTracker';
import Chunk from './Chunk';
import ExternalModule from './ExternalModule';
import Module, { defaultAcornOptions } from './Module';
import {
	Asset,
	InputOptions,
	IsExternal,
	ModuleJSON,
	OutputBundle,
	ResolvedId,
	ResolveIdResult,
	RollupCache,
	RollupWarning,
	RollupWatcher,
	SerializablePluginCache,
	SourceDescription,
	TreeshakingOptions,
	WarningHandler
} from './rollup/types';
import { finaliseAsset } from './utils/assetHooks';
import { assignChunkColouringHashes } from './utils/chunkColouring';
import { Uint8ArrayToHexString } from './utils/entryHashing';
import { error } from './utils/error';
import { analyseModuleExecution, sortByExecutionOrder } from './utils/executionOrder';
import { isRelative, resolve } from './utils/path';
import { createPluginDriver, PluginDriver } from './utils/pluginDriver';
import relativeId, { getAliasName } from './utils/relativeId';
import { timeEnd, timeStart } from './utils/timers';
import transform from './utils/transform';

function makeOnwarn() {
	const warned = Object.create(null);

	return (warning: any) => {
		const str = warning.toString();
		if (str in warned) return;
		console.error(str); //eslint-disable-line no-console
		warned[str] = true;
	};
}

export default class Graph {
	acornOptions: acorn.Options;
	acornParser: typeof acorn.Parser;
	assetsById = new Map<string, Asset>();
	contextParse: (code: string, acornOptions?: acorn.Options) => ESTree.Program;
	curChunkIndex = 0;
	deoptimizationTracker: EntityPathTracker;
	// track graph build status as each graph instance is used only once
	finished = false;
	getModuleContext: (id: string) => string;
	isExternal: IsExternal;
	isPureExternalModule: (id: string) => boolean;
	moduleById = new Map<string, Module | ExternalModule>();
	needsTreeshakingPass: boolean = false;
	pluginDriver: PluginDriver;
	preserveModules: boolean;
	scope: GlobalScope;
	shimMissingExports: boolean;
	// deprecated
	treeshake: boolean;
	treeshakingOptions: TreeshakingOptions;
	watchFiles: Record<string, true> = Object.create(null);

	private cachedModules: Map<string, ModuleJSON>;
	private cacheExpiry: number;
	private context: string;
	private externalModules: ExternalModule[] = [];
	private modules: Module[] = [];
	private onwarn: WarningHandler;
	private pluginCache: Record<string, SerializablePluginCache>;

	constructor(options: InputOptions, watcher?: RollupWatcher) {
		this.curChunkIndex = 0;
		this.deoptimizationTracker = new EntityPathTracker();
		this.cachedModules = new Map();
		if (options.cache) {
			if (options.cache.modules)
				for (const module of options.cache.modules) this.cachedModules.set(module.id, module);
		}
		if (options.cache !== false) {
			this.pluginCache = (options.cache && options.cache.plugins) || Object.create(null);

			// increment access counter
			for (const name in this.pluginCache) {
				const cache = this.pluginCache[name];
				for (const key of Object.keys(cache)) cache[key][0]++;
			}
		}
		this.preserveModules = options.preserveModules;

		this.cacheExpiry = options.experimentalCacheExpiry;

		if (!options.input) {
			throw new Error('You must supply options.input to rollup');
		}

		this.treeshake = options.treeshake !== false;
		if (this.treeshake) {
			this.treeshakingOptions = options.treeshake
				? {
						annotations: (<TreeshakingOptions>options.treeshake).annotations !== false,
						propertyReadSideEffects:
							(<TreeshakingOptions>options.treeshake).propertyReadSideEffects !== false,
						pureExternalModules: (<TreeshakingOptions>options.treeshake).pureExternalModules
				  }
				: { propertyReadSideEffects: true, annotations: true, pureExternalModules: false };
			if (this.treeshakingOptions.pureExternalModules === true) {
				this.isPureExternalModule = () => true;
			} else if (typeof this.treeshakingOptions.pureExternalModules === 'function') {
				this.isPureExternalModule = this.treeshakingOptions.pureExternalModules;
			} else if (Array.isArray(this.treeshakingOptions.pureExternalModules)) {
				const pureExternalModules = new Set(this.treeshakingOptions.pureExternalModules);
				this.isPureExternalModule = id => pureExternalModules.has(id);
			} else {
				this.isPureExternalModule = () => false;
			}
		} else {
			this.isPureExternalModule = () => false;
		}

		this.contextParse = (code: string, options: acorn.Options = {}) => {
			return this.acornParser.parse(code, {
				...defaultAcornOptions,
				...options,
				...this.acornOptions
			}) as any;
		};

		this.pluginDriver = createPluginDriver(this, options, this.pluginCache, watcher);

		if (watcher) {
			const handleChange = (id: string) => this.pluginDriver.hookSeqSync('watchChange', [id]);
			watcher.on('change', handleChange);
			watcher.once('restart', () => {
				watcher.removeListener('change', handleChange);
			});
		}

		if (typeof options.external === 'function') {
			const external = options.external;
			this.isExternal = (id, parentId, isResolved) =>
				!id.startsWith('\0') && external(id, parentId, isResolved);
		} else {
			const external = options.external;
			const ids = new Set(Array.isArray(external) ? external : external ? [external] : []);
			this.isExternal = id => ids.has(id);
		}

		this.shimMissingExports = options.shimMissingExports;
		this.scope = new GlobalScope();
		this.context = String(options.context);

		const optionsModuleContext = options.moduleContext;
		if (typeof optionsModuleContext === 'function') {
			this.getModuleContext = id => optionsModuleContext(id) || this.context;
		} else if (typeof optionsModuleContext === 'object') {
			const moduleContext = new Map();
			for (const key in optionsModuleContext) {
				moduleContext.set(resolve(key), optionsModuleContext[key]);
			}
			this.getModuleContext = id => moduleContext.get(id) || this.context;
		} else {
			this.getModuleContext = () => this.context;
		}

		this.onwarn = options.onwarn || makeOnwarn();
		this.acornOptions = options.acorn || {};
		const acornPluginsToInject = [];

		acornPluginsToInject.push(injectDynamicImportPlugin);
		acornPluginsToInject.push(injectImportMeta);

		if (options.experimentalTopLevelAwait) {
			(<any>this.acornOptions).allowAwaitOutsideFunction = true;
		}

		const acornInjectPlugins = options.acornInjectPlugins;
		acornPluginsToInject.push(
			...(Array.isArray(acornInjectPlugins)
				? acornInjectPlugins
				: acornInjectPlugins
				? [acornInjectPlugins]
				: [])
		);
		this.acornParser = <any>acorn.Parser.extend(...acornPluginsToInject);
	}

	build(
		entryModules: string | string[] | Record<string, string>,
		manualChunks: Record<string, string[]> | void,
		inlineDynamicImports: boolean
	): Promise<Chunk[]> {
		// Phase 1 – discovery. We load the entry module and find which
		// modules it imports, and import those, until we have all
		// of the entry module's dependencies

		timeStart('parse modules', 2);

		return this.loadEntryModules(entryModules, manualChunks).then(
			({ entryModules, entryModuleAliases, manualChunkModules }) => {
				timeEnd('parse modules', 2);

				// Phase 2 - linking. We populate the module dependency links and
				// determine the topological execution order for the bundle
				timeStart('analyse dependency graph', 2);

				for (let i = 0; i < entryModules.length; i++) {
					const entryModule = entryModules[i];
					const duplicateIndex = entryModules.indexOf(entryModule, i + 1);
					if (duplicateIndex !== -1) {
						error({
							code: 'DUPLICATE_ENTRY_POINTS',
							message: `Duplicate entry points detected. The input entries ${
								entryModuleAliases[i]
							} and ${entryModuleAliases[duplicateIndex]} both point to the same module, ${
								entryModule.id
							}`
						});
					}
				}

				this.link(entryModules);

				timeEnd('analyse dependency graph', 2);

				// Phase 3 – marking. We include all statements that should be included
				timeStart('mark included statements', 2);

				if (inlineDynamicImports) {
					if (entryModules.length > 1)
						throw new Error(
							'Internal Error: can only inline dynamic imports for single-file builds.'
						);
				}
				for (const entryModule of entryModules) entryModule.includeAllExports();
				this.includeMarked(this.modules);

				// check for unused external imports
				for (const externalModule of this.externalModules) externalModule.warnUnusedImports();

				timeEnd('mark included statements', 2);

				// Phase 4 – we construct the chunks, working out the optimal chunking using
				// entry point graph colouring, before generating the import and export facades
				timeStart('generate chunks', 2);

				if (!this.preserveModules && !inlineDynamicImports) {
					assignChunkColouringHashes(entryModules, manualChunkModules);
				}

				if (entryModuleAliases) {
					for (let i = entryModules.length - 1; i >= 0; i--) {
						entryModules[i].chunkAlias = entryModuleAliases[i];
					}
				}

				// TODO: there is one special edge case unhandled here and that is that any module
				//       exposed as an unresolvable export * (to a graph external export *,
				//       either as a namespace import reexported or top-level export *)
				//       should be made to be its own entry point module before chunking
				let chunks: Chunk[] = [];
				if (this.preserveModules) {
					for (const module of this.modules) {
						const chunk = new Chunk(this, [module]);
						if (module.isEntryPoint || !chunk.isEmpty) {
							chunk.entryModules = [module];
						}
						chunks.push(chunk);
					}
				} else {
					const chunkModules: { [entryHashSum: string]: Module[] } = {};
					for (const module of this.modules) {
						const entryPointsHashStr = Uint8ArrayToHexString(module.entryPointsHash);
						const curChunk = chunkModules[entryPointsHashStr];
						if (curChunk) {
							curChunk.push(module);
						} else {
							chunkModules[entryPointsHashStr] = [module];
						}
					}

					for (const entryHashSum in chunkModules) {
						const chunkModulesOrdered = chunkModules[entryHashSum];
						sortByExecutionOrder(chunkModulesOrdered);
						const chunk = new Chunk(this, chunkModulesOrdered);
						chunks.push(chunk);
					}
				}

				// for each chunk module, set up its imports to other
				// chunks, if those variables are included after treeshaking
				for (const chunk of chunks) {
					chunk.link();
				}

				// filter out empty dependencies
				chunks = chunks.filter(
					chunk => !chunk.isEmpty || chunk.entryModules.length > 0 || chunk.isManualChunk
				);

				// then go over and ensure all entry chunks export their variables
				for (const chunk of chunks) {
					if (this.preserveModules || chunk.entryModules.length > 0) {
						chunk.generateEntryExportsOrMarkAsTainted();
					}
				}

				// create entry point facades for entry module chunks that have tainted exports
				const facades = [];
				if (!this.preserveModules) {
					for (const chunk of chunks) {
						for (const entryModule of chunk.entryModules) {
							if (chunk.facadeModule !== entryModule) {
								const entryPointFacade = new Chunk(this, []);
								entryPointFacade.turnIntoFacade(entryModule);
								facades.push(entryPointFacade);
							}
						}
					}
				}

				timeEnd('generate chunks', 2);

				this.finished = true;
				return chunks.concat(facades);
			}
		);
	}

	finaliseAssets(assetFileNames: string) {
		const outputBundle: OutputBundle = Object.create(null);
		this.assetsById.forEach(asset => {
			if (asset.source !== undefined) finaliseAsset(asset, outputBundle, assetFileNames);
		});
		return outputBundle;
	}

	getCache(): RollupCache {
		// handle plugin cache eviction
		for (const name in this.pluginCache) {
			const cache = this.pluginCache[name];
			let allDeleted = true;
			for (const key of Object.keys(cache)) {
				if (cache[key][0] >= this.cacheExpiry) delete cache[key];
				else allDeleted = false;
			}
			if (allDeleted) delete this.pluginCache[name];
		}

		return <any>{
			modules: this.modules.map(module => module.toJSON()),
			plugins: this.pluginCache
		};
	}

	includeMarked(modules: Module[]) {
		if (this.treeshake) {
			let treeshakingPass = 1;
			do {
				timeStart(`treeshaking pass ${treeshakingPass}`, 3);
				this.needsTreeshakingPass = false;
				for (const module of modules) {
					if (module.isExecuted) module.include();
				}
				timeEnd(`treeshaking pass ${treeshakingPass++}`, 3);
			} while (this.needsTreeshakingPass);
		} else {
			// Necessary to properly replace namespace imports
			for (const module of modules) module.includeAllInBundle();
		}
	}

	warn(warning: RollupWarning) {
		warning.toString = () => {
			let str = '';

			if (warning.plugin) str += `(${warning.plugin} plugin) `;
			if (warning.loc)
				str += `${relativeId(warning.loc.file)} (${warning.loc.line}:${warning.loc.column}) `;
			str += warning.message;

			return str;
		};

		this.onwarn(warning);
	}

	private fetchAllDependencies(module: Module) {
		const fetchDynamicImportsPromise = Promise.all(
			module.getDynamicImportExpressions().map((dynamicImportExpression, index) =>
				this.pluginDriver
					.hookFirst('resolveDynamicImport', [dynamicImportExpression, module.id])
					.then(replacement => {
						if (!replacement) return;
						const dynamicImport = module.dynamicImports[index];
						dynamicImport.alias = getAliasName(
							replacement,
							typeof dynamicImportExpression === 'string' ? dynamicImportExpression : undefined
						);
						if (typeof dynamicImportExpression !== 'string') {
							dynamicImport.resolution = replacement;
						} else if (this.isExternal(replacement, module.id, true)) {
							let externalModule;
							if (!this.moduleById.has(replacement)) {
								externalModule = new ExternalModule({
									graph: this,
									id: replacement
								});
								this.externalModules.push(externalModule);
								this.moduleById.set(replacement, module);
							} else {
								externalModule = <ExternalModule>this.moduleById.get(replacement);
							}
							dynamicImport.resolution = externalModule;
							externalModule.exportsNamespace = true;
						} else {
							return this.fetchModule(replacement, module.id).then(depModule => {
								dynamicImport.resolution = depModule;
							});
						}
					})
			)
		);
		fetchDynamicImportsPromise.catch(() => {});

		return Promise.all(
			module.sources.map(source => this.resolveAndFetchDependency(module, source))
		).then(() => fetchDynamicImportsPromise);
	}

	private fetchModule(id: string, importer: string): Promise<Module> {
		// short-circuit cycles
		const existingModule = this.moduleById.get(id);
		if (existingModule) {
			if (existingModule.isExternal) throw new Error(`Cannot fetch external module ${id}`);
			return Promise.resolve(<Module>existingModule);
		}

		const module: Module = new Module(this, id);
		this.moduleById.set(id, module);
		this.watchFiles[id] = true;

		timeStart('load modules', 3);
		return Promise.resolve(this.pluginDriver.hookFirst('load', [id]))
			.catch((err: Error) => {
				timeEnd('load modules', 3);
				let msg = `Could not load ${id}`;
				if (importer) msg += ` (imported by ${importer})`;

				msg += `: ${err.message}`;
				throw new Error(msg);
			})
			.then(source => {
				timeEnd('load modules', 3);
				if (typeof source === 'string') return source;
				if (source && typeof source === 'object' && typeof source.code === 'string') return source;

				// TODO report which plugin failed
				error({
					code: 'BAD_LOADER',
					message: `Error loading ${relativeId(
						id
					)}: plugin load hook should return a string, a { code, map } object, or nothing/null`
				});
			})
			.then(source => {
				const sourceDescription: SourceDescription =
					typeof source === 'string'
						? {
								ast: null,
								code: source
						  }
						: source;

				const cachedModule = this.cachedModules.get(id);
				if (
					cachedModule &&
					!cachedModule.customTransformCache &&
					cachedModule.originalCode === sourceDescription.code
				) {
					// re-emit transform assets
					if (cachedModule.transformAssets) {
						for (const asset of cachedModule.transformAssets)
							this.pluginDriver.emitAsset(asset.name, asset.source);
					}
					return cachedModule;
				}

				return transform(this, sourceDescription, module);
			})
			.then((source: ModuleJSON) => {
				module.setSource(source);

				this.modules.push(module);
				this.moduleById.set(id, module);

				return this.fetchAllDependencies(module).then(() => {
					for (const name in module.exports) {
						if (name !== 'default') {
							module.exportsAll[name] = module.id;
						}
					}
					module.exportAllSources.forEach(source => {
						const id = module.resolvedIds[source].id;
						const exportAllModule = this.moduleById.get(id);
						if (exportAllModule.isExternal) return;

						for (const name in (<Module>exportAllModule).exportsAll) {
							if (name in module.exportsAll) {
								this.warn({
									code: 'NAMESPACE_CONFLICT',
									message: `Conflicting namespaces: ${relativeId(
										module.id
									)} re-exports '${name}' from both ${relativeId(
										module.exportsAll[name]
									)} and ${relativeId(
										(<Module>exportAllModule).exportsAll[name]
									)} (will be ignored)`,
									name,
									reexporter: module.id,
									sources: [module.exportsAll[name], (<Module>exportAllModule).exportsAll[name]]
								});
							} else {
								module.exportsAll[name] = (<Module>exportAllModule).exportsAll[name];
							}
						}
					});
					return module;
				});
			});
	}

	private link(entryModules: Module[]) {
		for (const module of this.modules) {
			module.linkDependencies();
		}
		const { orderedModules, cyclePaths } = analyseModuleExecution(entryModules);
		for (const cyclePath of cyclePaths) {
			this.warn({
				code: 'CIRCULAR_DEPENDENCY',
				importer: cyclePath[0],
				message: `Circular dependency: ${cyclePath.join(' -> ')}`
			});
		}
		this.modules = orderedModules;
		for (const module of this.modules) {
			module.bindReferences();
		}
		this.warnForMissingExports();
	}

	private loadEntryModules(
		entryModules: string | string[] | Record<string, string>,
		manualChunks: Record<string, string[]> | void
	) {
		let removeAliasExtensions = false;
		let entryModuleIds: string[];
		let entryModuleAliases: string[];
		if (typeof entryModules === 'string') entryModules = [entryModules];

		if (Array.isArray(entryModules)) {
			removeAliasExtensions = true;
			entryModuleAliases = entryModules.concat([]);
			entryModuleIds = entryModules;
		} else {
			entryModuleAliases = Object.keys(entryModules);
			entryModuleIds = entryModuleAliases.map(name => (<Record<string, string>>entryModules)[name]);
		}

		const entryAndManualChunkIds = entryModuleIds.concat([]);
		if (manualChunks) {
			Object.keys(manualChunks).forEach(name => {
				const manualChunkIds = manualChunks[name];
				manualChunkIds.forEach(id => {
					if (entryAndManualChunkIds.indexOf(id) === -1) entryAndManualChunkIds.push(id);
				});
			});
		}

		return Promise.all(entryAndManualChunkIds.map(id => this.loadModule(id))).then(
			entryAndChunkModules => {
				if (removeAliasExtensions) {
					for (let i = 0; i < entryModuleAliases.length; i++)
						entryModuleAliases[i] = getAliasName(entryAndChunkModules[i].id, entryModuleAliases[i]);
				}

				const entryModules = entryAndChunkModules.slice(0, entryModuleIds.length);

				let manualChunkModules: { [chunkName: string]: Module[] };
				if (manualChunks) {
					manualChunkModules = {};
					for (const chunkName of Object.keys(manualChunks)) {
						const chunk = manualChunks[chunkName];
						manualChunkModules[chunkName] = chunk.map(entryId => {
							const entryIndex = entryAndManualChunkIds.indexOf(entryId);
							return entryAndChunkModules[entryIndex];
						});
					}
				}

				return { entryModules, entryModuleAliases, manualChunkModules };
			}
		);
	}

	private loadModule(entryName: string) {
		return this.pluginDriver
			.hookFirst<string | boolean | void>('resolveId', [entryName, undefined])
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
						message: `Could not resolve entry (${entryName})`
					});
				}

				return this.fetchModule(<string>id, undefined);
			});
	}

	private normalizeResolveIdResult(
		resolveIdResult: ResolveIdResult,
		module: Module,
		source: string
	): ResolvedId {
		if (resolveIdResult) {
			if (typeof resolveIdResult === 'object') {
				return resolveIdResult;
			}
			return { id: resolveIdResult, external: this.isExternal(resolveIdResult, module.id, true) };
		}
		const externalId = isRelative(source) ? resolve(module.id, '..', source) : source;
		if (resolveIdResult !== false && !this.isExternal(externalId, module.id, true)) {
			if (isRelative(source)) {
				error({
					code: 'UNRESOLVED_IMPORT',
					message: `Could not resolve '${source}' from ${relativeId(module.id)}`
				});
			}
			this.warn({
				code: 'UNRESOLVED_IMPORT',
				importer: relativeId(module.id),
				message: `'${source}' is imported by ${relativeId(
					module.id
				)}, but could not be resolved – treating it as an external dependency`,
				source,
				url: 'https://rollupjs.org/guide/en#warning-treating-module-as-external-dependency'
			});
		}
		return { id: externalId, external: true };
	}

	private resolveAndFetchDependency(module: Module, source: string) {
		return Promise.resolve(
			module.resolvedIds[source] ||
				(this.isExternal(source, module.id, false)
					? { id: source, external: true }
					: this.pluginDriver
							.hookFirst<ResolveIdResult>('resolveId', [source, module.id])
							.then(result => this.normalizeResolveIdResult(result, module, source)))
		).then((resolvedId: ResolvedId) => {
			module.resolvedIds[source] = resolvedId;
			if (resolvedId.external) {
				if (!this.moduleById.has(resolvedId.id)) {
					const module = new ExternalModule({ graph: this, id: resolvedId.id });
					this.externalModules.push(module);
					this.moduleById.set(resolvedId.id, module);
				}

				const externalModule = this.moduleById.get(resolvedId.id);
				if (externalModule instanceof ExternalModule === false) {
					error({
						code: 'INVALID_EXTERNAL_ID',
						message: `'${source}' is imported as an external by ${relativeId(
							module.id
						)}, but is already an existing non-external module id.`
					});
				}
			} else {
				return this.fetchModule(resolvedId.id, module.id);
			}
		});
	}

	private warnForMissingExports() {
		for (const module of this.modules) {
			for (const importName of Object.keys(module.importDescriptions)) {
				const importDescription = module.importDescriptions[importName];
				if (
					importDescription.name !== '*' &&
					!importDescription.module.getVariableForExportName(importDescription.name)
				) {
					module.warn(
						{
							code: 'NON_EXISTENT_EXPORT',
							message: `Non-existent export '${
								importDescription.name
							}' is imported from ${relativeId(importDescription.module.id)}`,
							name: importDescription.name,
							source: importDescription.module.id
						},
						importDescription.start
					);
				}
			}
		}
	}
}
