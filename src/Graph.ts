import * as acorn from 'acorn';
import injectClassFields from 'acorn-class-fields';
import injectExportNsFrom from 'acorn-export-ns-from';
import injectImportMeta from 'acorn-import-meta';
import injectStaticClassFeatures from 'acorn-static-class-features';
import GlobalScope from './ast/scopes/GlobalScope';
import { PathTracker } from './ast/utils/PathTracker';
import Chunk from './Chunk';
import ExternalModule from './ExternalModule';
import Module, { defaultAcornOptions } from './Module';
import { ModuleLoader, UnresolvedModule } from './ModuleLoader';
import {
	GetManualChunk,
	InputOptions,
	IsExternal,
	ManualChunksOption,
	ModuleJSON,
	RollupCache,
	RollupWarning,
	RollupWatcher,
	SerializablePluginCache,
	TreeshakingOptions,
	WarningHandler
} from './rollup/types';
import { BuildPhase } from './utils/buildPhase';
import { getChunkAssignments } from './utils/chunkAssignment';
import { errDeprecation, error } from './utils/error';
import { analyseModuleExecution, sortByExecutionOrder } from './utils/executionOrder';
import { resolve } from './utils/path';
import { PluginDriver } from './utils/PluginDriver';
import relativeId from './utils/relativeId';
import { timeEnd, timeStart } from './utils/timers';

function normalizeEntryModules(
	entryModules: string | string[] | Record<string, string>
): UnresolvedModule[] {
	if (typeof entryModules === 'string') {
		return [{ fileName: null, name: null, id: entryModules, importer: undefined }];
	}
	if (Array.isArray(entryModules)) {
		return entryModules.map(id => ({ fileName: null, name: null, id, importer: undefined }));
	}
	return Object.keys(entryModules).map(name => ({
		fileName: null,
		id: entryModules[name],
		importer: undefined,
		name
	}));
}

export default class Graph {
	acornOptions: acorn.Options;
	acornParser: typeof acorn.Parser;
	cachedModules: Map<string, ModuleJSON>;
	contextParse: (code: string, acornOptions?: acorn.Options) => acorn.Node;
	deoptimizationTracker: PathTracker;
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

	constructor(options: InputOptions, watcher: RollupWatcher | null) {
		this.onwarn = options.onwarn as WarningHandler;
		this.deoptimizationTracker = new PathTracker();
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
		this.preserveModules = options.preserveModules!;
		this.strictDeprecations = options.strictDeprecations!;

		this.cacheExpiry = options.experimentalCacheExpiry!;

		if (options.treeshake !== false) {
			this.treeshakingOptions =
				options.treeshake && options.treeshake !== true
					? {
							annotations: options.treeshake.annotations !== false,
							moduleSideEffects: options.treeshake.moduleSideEffects,
							propertyReadSideEffects: options.treeshake.propertyReadSideEffects !== false,
							pureExternalModules: options.treeshake.pureExternalModules,
							tryCatchDeoptimization: options.treeshake.tryCatchDeoptimization !== false,
							unknownGlobalSideEffects: options.treeshake.unknownGlobalSideEffects !== false
					  }
					: {
							annotations: true,
							moduleSideEffects: true,
							propertyReadSideEffects: true,
							tryCatchDeoptimization: true,
							unknownGlobalSideEffects: true
					  };
			if (typeof this.treeshakingOptions.pureExternalModules !== 'undefined') {
				this.warnDeprecation(
					`The "treeshake.pureExternalModules" option is deprecated. The "treeshake.moduleSideEffects" option should be used instead. "treeshake.pureExternalModules: true" is equivalent to "treeshake.moduleSideEffects: 'no-external'"`,
					true
				);
			}
		}

		this.contextParse = (code: string, options: acorn.Options = {}) =>
			this.acornParser.parse(code, {
				...defaultAcornOptions,
				...options,
				...this.acornOptions
			});

		this.pluginDriver = new PluginDriver(this, options.plugins!, this.pluginCache);

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

		this.acornOptions = options.acorn ? { ...options.acorn } : {};
		const acornPluginsToInject: Function[] = [];

		acornPluginsToInject.push(
			injectImportMeta,
			injectExportNsFrom,
			injectClassFields,
			injectStaticClassFeatures
		);

		(this.acornOptions as any).allowAwaitOutsideFunction = true;

		const acornInjectPlugins = options.acornInjectPlugins;
		acornPluginsToInject.push(
			...(Array.isArray(acornInjectPlugins)
				? acornInjectPlugins
				: acornInjectPlugins
				? [acornInjectPlugins]
				: [])
		);
		this.acornParser = acorn.Parser.extend(...(acornPluginsToInject as any));
		this.moduleLoader = new ModuleLoader(
			this,
			this.moduleById,
			this.pluginDriver,
			options.preserveSymlinks === true,
			options.external as (string | RegExp)[] | IsExternal,
			(typeof options.manualChunks === 'function' && options.manualChunks) as GetManualChunk | null,
			(this.treeshakingOptions ? this.treeshakingOptions.moduleSideEffects : null)!,
			(this.treeshakingOptions ? this.treeshakingOptions.pureExternalModules : false)!
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

			// TODO: there is one special edge case unhandled here and that is that any module
			//       exposed as an unresolvable export * (to a graph external export *,
			//       either as a namespace import reexported or top-level export *)
			//       should be made to be its own entry point module before chunking
			const chunks: Chunk[] = [];
			if (this.preserveModules) {
				for (const module of this.modules) {
					if (
						module.isIncluded() ||
						module.isEntryPoint ||
						module.dynamicallyImportedBy.length > 0
					) {
						const chunk = new Chunk(this, [module]);
						chunk.entryModules = [module];
						chunks.push(chunk);
					}
				}
			} else {
				for (const chunkModules of inlineDynamicImports
					? [this.modules]
					: getChunkAssignments(entryModules, manualChunkModulesByAlias)) {
					sortByExecutionOrder(chunkModules);
					chunks.push(new Chunk(this, chunkModules));
				}
			}

			for (const chunk of chunks) {
				chunk.link();
			}
			const facades: Chunk[] = [];
			for (const chunk of chunks) {
				facades.push(...chunk.generateFacades());
			}

			timeEnd('generate chunks', 2);

			this.phase = BuildPhase.GENERATE;
			return [...chunks, ...facades];
		});
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
		};
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
				str += `${relativeId(warning.loc.file!)} (${warning.loc.line}:${warning.loc.column}) `;
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
				cycle: cyclePath,
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
