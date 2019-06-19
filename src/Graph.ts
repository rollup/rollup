import * as acorn from 'acorn';
import injectBigInt from 'acorn-bigint';
import injectDynamicImportPlugin from 'acorn-dynamic-import';
import injectImportMeta from 'acorn-import-meta';
import * as ESTree from 'estree';
import GlobalScope from './ast/scopes/GlobalScope';
import { EntityPathTracker } from './ast/utils/EntityPathTracker';
import Chunk, { isChunkRendered } from './Chunk';
import ExternalModule from './ExternalModule';
import Module, { defaultAcornOptions } from './Module';
import { ModuleLoader, UnresolvedModuleWithAlias } from './ModuleLoader';
import {
	Asset,
	ExternalOption,
	GetManualChunk,
	InputOptions,
	ManualChunksOption,
	ModuleJSON,
	ModuleSideEffectsOption,
	OutputBundle,
	PureModulesOption,
	RollupCache,
	RollupWarning,
	RollupWatcher,
	SerializablePluginCache,
	TreeshakingOptions,
	WarningHandler
} from './rollup/types';
import { finaliseAsset } from './utils/assetHooks';
import { BuildPhase } from './utils/buildPhase';
import { assignChunkColouringHashes } from './utils/chunkColouring';
import { Uint8ArrayToHexString } from './utils/entryHashing';
import { errDeprecation, error } from './utils/error';
import { analyseModuleExecution, sortByExecutionOrder } from './utils/executionOrder';
import { resolve } from './utils/path';
import { createPluginDriver, PluginDriver } from './utils/pluginDriver';
import relativeId from './utils/relativeId';
import { timeEnd, timeStart } from './utils/timers';

function makeOnwarn() {
	const warned = Object.create(null);

	return (warning: any) => {
		const str = warning.toString();
		if (str in warned) return;
		console.error(str);
		warned[str] = true;
	};
}

function normalizeEntryModules(
	entryModules: string | string[] | Record<string, string>
): UnresolvedModuleWithAlias[] {
	if (typeof entryModules === 'string') {
		return [{ alias: null, unresolvedId: entryModules }];
	}
	if (Array.isArray(entryModules)) {
		return entryModules.map(unresolvedId => ({ alias: null, unresolvedId }));
	}
	return Object.keys(entryModules).map(alias => ({
		alias,
		unresolvedId: entryModules[alias]
	}));
}

export default class Graph {
	acornOptions: acorn.Options;
	acornParser: typeof acorn.Parser;
	assetsById = new Map<string, Asset>();
	cachedModules: Map<string, ModuleJSON>;
	contextParse: (code: string, acornOptions?: acorn.Options) => ESTree.Program;
	curChunkIndex = 0;
	deoptimizationTracker: EntityPathTracker;
	getModuleContext: (id: string) => string;
	moduleById = new Map<string, Module | ExternalModule>();
	moduleLoader: ModuleLoader;
	needsTreeshakingPass = false;
	phase: BuildPhase = BuildPhase.LOAD_AND_PARSE;
	pluginDriver: PluginDriver;
	preserveModules: boolean;
	scope: GlobalScope;
	shimMissingExports: boolean;
	treeshakingOptions?: TreeshakingOptions;
	watchFiles: Record<string, true> = Object.create(null);

	private cacheExpiry: number;
	private context: string;
	private externalModules: ExternalModule[] = [];
	private modules: Module[] = [];
	private onwarn: WarningHandler;
	private pluginCache?: Record<string, SerializablePluginCache>;
	private strictDeprecations: boolean;

	constructor(options: InputOptions, watcher?: RollupWatcher) {
		this.onwarn = (options.onwarn as WarningHandler) || makeOnwarn();
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
		this.preserveModules = options.preserveModules as boolean;
		this.strictDeprecations = options.strictDeprecations as boolean;

		this.cacheExpiry = options.experimentalCacheExpiry as number;

		if (options.treeshake !== false) {
			this.treeshakingOptions = options.treeshake
				? {
						annotations: (options.treeshake as TreeshakingOptions).annotations !== false,
						moduleSideEffects: (options.treeshake as TreeshakingOptions).moduleSideEffects,
						propertyReadSideEffects:
							(options.treeshake as TreeshakingOptions).propertyReadSideEffects !== false,
						pureExternalModules: (options.treeshake as TreeshakingOptions).pureExternalModules,
						tryCatchDeoptimization:
							(options.treeshake as TreeshakingOptions).tryCatchDeoptimization !== false
				  }
				: {
						annotations: true,
						moduleSideEffects: true,
						propertyReadSideEffects: true,
						tryCatchDeoptimization: true
				  };
			if (typeof this.treeshakingOptions.pureExternalModules !== 'undefined') {
				this.warnDeprecation(
					`The "treeshake.pureExternalModules" option is deprecated. The "treeshake.moduleSideEffects" option should be used instead. "treeshake.pureExternalModules: true" is equivalent to "treeshake.moduleSideEffects: 'no-external'"`,
					false
				);
			}
		}

		this.contextParse = (code: string, options: acorn.Options = {}) =>
			this.acornParser.parse(code, {
				...defaultAcornOptions,
				...options,
				...this.acornOptions
			}) as any;

		this.pluginDriver = createPluginDriver(this, options, this.pluginCache, watcher);

		if (watcher) {
			const handleChange = (id: string) => this.pluginDriver.hookSeqSync('watchChange', [id]);
			watcher.on('change', handleChange);
			watcher.once('restart', () => {
				watcher.removeListener('change', handleChange);
			});
		}

		this.shimMissingExports = options.shimMissingExports as boolean;
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

		this.acornOptions = options.acorn || {};
		const acornPluginsToInject = [];

		acornPluginsToInject.push(injectDynamicImportPlugin);
		acornPluginsToInject.push(injectImportMeta);
		acornPluginsToInject.push(injectBigInt);

		if (options.experimentalTopLevelAwait) {
			(this.acornOptions as any).allowAwaitOutsideFunction = true;
		}

		const acornInjectPlugins = options.acornInjectPlugins;
		acornPluginsToInject.push(
			...(Array.isArray(acornInjectPlugins)
				? acornInjectPlugins
				: acornInjectPlugins
				? [acornInjectPlugins]
				: [])
		);
		this.acornParser = acorn.Parser.extend(...acornPluginsToInject) as any;
		this.moduleLoader = new ModuleLoader(
			this,
			this.moduleById,
			this.pluginDriver,
			options.external as ExternalOption,
			(typeof options.manualChunks === 'function' && options.manualChunks) as GetManualChunk | null,
			(this.treeshakingOptions
				? this.treeshakingOptions.moduleSideEffects
				: null) as ModuleSideEffectsOption,
			(this.treeshakingOptions
				? this.treeshakingOptions.pureExternalModules
				: false) as PureModulesOption
		);
	}

	build(
		entryModules: string | string[] | Record<string, string>,
		manualChunks: ManualChunksOption | void,
		inlineDynamicImports: boolean
	): Promise<Chunk[]> {
		// Phase 1 – discovery. We load the entry module and find which
		// modules it imports, and import those, until we have all
		// of the entry module's dependencies

		timeStart('parse modules', 2);

		return Promise.all([
			this.moduleLoader.addEntryModules(normalizeEntryModules(entryModules), true),
			(manualChunks &&
				typeof manualChunks === 'object' &&
				this.moduleLoader.addManualChunks(manualChunks)) as Promise<void>
		]).then(([{ entryModules, manualChunkModulesByAlias }]) => {
			if (entryModules.length === 0) {
				throw new Error('You must supply options.input to rollup');
			}
			for (const module of this.moduleById.values()) {
				if (module instanceof Module) {
					this.modules.push(module);
					this.watchFiles[module.id] = true;
				} else {
					this.externalModules.push(module);
				}
			}
			timeEnd('parse modules', 2);

			this.phase = BuildPhase.ANALYSE;

			// Phase 2 - linking. We populate the module dependency links and
			// determine the topological execution order for the bundle
			timeStart('analyse dependency graph', 2);

			this.link(entryModules);

			timeEnd('analyse dependency graph', 2);

			// Phase 3 – marking. We include all statements that should be included
			timeStart('mark included statements', 2);

			if (inlineDynamicImports) {
				if (entryModules.length > 1) {
					throw new Error(
						'Internal Error: can only inline dynamic imports for single-file builds.'
					);
				}
			}
			for (const module of entryModules) {
				module.includeAllExports();
			}
			this.includeMarked(this.modules);

			// check for unused external imports
			for (const externalModule of this.externalModules) externalModule.warnUnusedImports();

			timeEnd('mark included statements', 2);

			// Phase 4 – we construct the chunks, working out the optimal chunking using
			// entry point graph colouring, before generating the import and export facades
			timeStart('generate chunks', 2);

			if (!this.preserveModules && !inlineDynamicImports) {
				assignChunkColouringHashes(entryModules, manualChunkModulesByAlias);
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

			for (const chunk of chunks) {
				chunk.link();
			}
			chunks = chunks.filter(isChunkRendered);
			const facades: Chunk[] = [];
			for (const chunk of chunks) {
				for (const facade of chunk.generateFacades()) {
					facades.push(facade);
				}
			}

			timeEnd('generate chunks', 2);

			this.phase = BuildPhase.GENERATE;
			return chunks.concat(facades);
		});
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

		return {
			modules: this.modules.map(module => module.toJSON()),
			plugins: this.pluginCache
		} as any;
	}

	includeMarked(modules: Module[]) {
		if (this.treeshakingOptions) {
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
				str += `${relativeId(warning.loc.file as string)} (${warning.loc.line}:${
					warning.loc.column
				}) `;
			str += warning.message;

			return str;
		};

		this.onwarn(warning);
	}

	warnDeprecation(deprecation: string | RollupWarning, activeDeprecation: boolean): void {
		if (activeDeprecation || this.strictDeprecations) {
			const warning = errDeprecation(deprecation);
			if (this.strictDeprecations) {
				return error(warning);
			}
			this.warn(warning);
		}
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

	private warnForMissingExports() {
		for (const module of this.modules) {
			for (const importName of Object.keys(module.importDescriptions)) {
				const importDescription = module.importDescriptions[importName];
				if (
					importDescription.name !== '*' &&
					!(importDescription.module as Module).getVariableForExportName(importDescription.name)
				) {
					module.warn(
						{
							code: 'NON_EXISTENT_EXPORT',
							message: `Non-existent export '${
								importDescription.name
							}' is imported from ${relativeId((importDescription.module as Module).id)}`,
							name: importDescription.name,
							source: (importDescription.module as Module).id
						},
						importDescription.start
					);
				}
			}
		}
	}
}
