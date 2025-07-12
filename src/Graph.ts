import flru from 'flru';
import { createInclusionContext } from './ast/ExecutionContext';
import type { ExpressionEntity } from './ast/nodes/shared/Expression';
import GlobalScope from './ast/scopes/GlobalScope';
import { EntityPathTracker } from './ast/utils/PathTracker';
import type ExternalModule from './ExternalModule';
import Module from './Module';
import { ModuleLoader, type UnresolvedModule } from './ModuleLoader';
import type {
	ast,
	ModuleInfo,
	ModuleJSON,
	NormalizedInputOptions,
	RollupCache,
	RollupWatcher,
	SerializablePluginCache,
	WatchChangeHook
} from './rollup/types';
import { BuildPhase } from './utils/buildPhase';
import { analyseModuleExecution } from './utils/executionOrder';
import { LOGLEVEL_WARN } from './utils/logging';
import {
	error,
	logCircularDependency,
	logImplicitDependantIsNotIncluded,
	logMissingExport
} from './utils/logs';
import { PluginDriver } from './utils/PluginDriver';
import type { PureFunctions } from './utils/pureFunctions';
import { getPureFunctions } from './utils/pureFunctions';
import Queue from './utils/Queue';
import { timeEnd, timeStart } from './utils/timers';
import { markModuleAndImpureDependenciesAsExecuted } from './utils/traverseStaticDependencies';

function normalizeEntryModules(
	entryModules: readonly string[] | Record<string, string>
): UnresolvedModule[] {
	if (Array.isArray(entryModules)) {
		return entryModules.map(id => ({
			fileName: null,
			id,
			implicitlyLoadedAfter: [],
			importer: undefined,
			name: null
		}));
	}
	return Object.entries(entryModules).map(([name, id]) => ({
		fileName: null,
		id,
		implicitlyLoadedAfter: [],
		importer: undefined,
		name
	}));
}

export default class Graph {
	readonly astLru = flru<ast.Program>(5);
	readonly cachedModules = new Map<string, ModuleJSON>();
	readonly deoptimizationTracker = new EntityPathTracker();
	entryModules: Module[] = [];
	readonly fileOperationQueue: Queue;
	readonly moduleLoader: ModuleLoader;
	readonly modulesById = new Map<string, Module | ExternalModule>();
	needsTreeshakingPass = false;
	readonly newlyIncludedVariableInits = new Set<ExpressionEntity>();
	phase: BuildPhase = BuildPhase.LOAD_AND_PARSE;
	readonly pluginDriver: PluginDriver;
	readonly pureFunctions: PureFunctions;
	readonly scope = new GlobalScope();
	readonly watchFiles: Record<string, true> = Object.create(null);
	watchMode = false;

	private readonly externalModules: ExternalModule[] = [];
	private implicitEntryModules: Module[] = [];
	private modules: Module[] = [];
	declare private pluginCache?: Record<string, SerializablePluginCache>;

	constructor(
		private readonly options: NormalizedInputOptions,
		watcher: RollupWatcher | null
	) {
		if (options.cache !== false) {
			if (options.cache?.modules) {
				for (const module of options.cache.modules) this.cachedModules.set(module.id, module);
			}
			this.pluginCache = options.cache?.plugins || Object.create(null);

			// increment access counter
			for (const name in this.pluginCache) {
				const cache = this.pluginCache[name];
				for (const value of Object.values(cache)) value[0]++;
			}
		}

		if (watcher) {
			this.watchMode = true;
			const handleChange = (...parameters: Parameters<WatchChangeHook>) =>
				this.pluginDriver.hookParallel('watchChange', parameters);
			const handleClose = () => this.pluginDriver.hookParallel('closeWatcher', []);
			watcher.onCurrentRun('change', handleChange);
			watcher.onCurrentRun('close', handleClose);
		}
		this.pluginDriver = new PluginDriver(this, options, options.plugins, this.pluginCache);
		this.moduleLoader = new ModuleLoader(this, this.modulesById, this.options, this.pluginDriver);
		this.fileOperationQueue = new Queue(options.maxParallelFileOps);
		this.pureFunctions = getPureFunctions(options);
	}

	async build(): Promise<void> {
		timeStart('generate module graph', 2);
		await this.generateModuleGraph();
		timeEnd('generate module graph', 2);

		timeStart('sort and bind modules', 2);
		this.phase = BuildPhase.ANALYSE;
		this.sortModules();
		timeEnd('sort and bind modules', 2);

		timeStart('mark included statements', 2);
		this.includeStatements();
		timeEnd('mark included statements', 2);

		this.phase = BuildPhase.GENERATE;
	}

	getCache(): RollupCache {
		// handle plugin cache eviction
		for (const name in this.pluginCache) {
			const cache = this.pluginCache[name];
			let allDeleted = true;
			for (const [key, value] of Object.entries(cache)) {
				if (value[0] >= this.options.experimentalCacheExpiry) delete cache[key];
				else allDeleted = false;
			}
			if (allDeleted) delete this.pluginCache[name];
		}

		return {
			modules: this.modules.map(module => module.toJSON()),
			plugins: this.pluginCache
		};
	}

	getModuleInfo = (moduleId: string): ModuleInfo | null => {
		const foundModule = this.modulesById.get(moduleId);
		if (!foundModule) return null;
		return foundModule.info;
	};

	private async generateModuleGraph(): Promise<void> {
		({ entryModules: this.entryModules, implicitEntryModules: this.implicitEntryModules } =
			await this.moduleLoader.addEntryModules(normalizeEntryModules(this.options.input), true));
		if (this.entryModules.length === 0) {
			throw new Error('You must supply options.input to rollup');
		}
		for (const module of this.modulesById.values()) {
			module.cacheInfoGetters();
			if (module instanceof Module) {
				this.modules.push(module);
			} else {
				this.externalModules.push(module);
			}
		}
	}

	private includeStatements(): void {
		const entryModules = [...this.entryModules, ...this.implicitEntryModules];
		for (const module of entryModules) {
			markModuleAndImpureDependenciesAsExecuted(module);
		}
		if (this.options.treeshake) {
			let treeshakingPass = 1;
			this.newlyIncludedVariableInits.clear();
			do {
				timeStart(`treeshaking pass ${treeshakingPass}`, 3);
				this.needsTreeshakingPass = false;
				for (const module of this.modules) {
					if (module.isExecuted) {
						module.hasTreeShakingPassStarted = true;
						if (module.info.moduleSideEffects === 'no-treeshake') {
							module.includeAllInBundle();
						} else {
							module.include();
						}
						for (const entity of this.newlyIncludedVariableInits) {
							this.newlyIncludedVariableInits.delete(entity);
							entity.include(createInclusionContext(), false);
						}
					}
				}
				if (treeshakingPass === 1) {
					// We only include exports after the first pass to avoid issues with
					// the TDZ detection logic
					for (const module of entryModules) {
						if (module.preserveSignature !== false) {
							module.includeAllExports(false);
							this.needsTreeshakingPass = true;
						}
					}
				}
				timeEnd(`treeshaking pass ${treeshakingPass++}`, 3);
			} while (this.needsTreeshakingPass);
		} else {
			for (const module of this.modules) module.includeAllInBundle();
		}
		for (const externalModule of this.externalModules) externalModule.warnUnusedImports();
		for (const module of this.implicitEntryModules) {
			for (const dependant of module.implicitlyLoadedAfter) {
				if (!(dependant.info.isEntry || dependant.isIncluded())) {
					error(logImplicitDependantIsNotIncluded(dependant));
				}
			}
		}
	}

	private sortModules(): void {
		const { orderedModules, cyclePaths } = analyseModuleExecution(this.entryModules);
		for (const cyclePath of cyclePaths) {
			this.options.onLog(LOGLEVEL_WARN, logCircularDependency(cyclePath));
		}
		this.modules = orderedModules;
		for (const module of this.modules) {
			module.bindReferences();
		}
		this.warnForMissingExports();
	}

	private warnForMissingExports(): void {
		for (const module of this.modules) {
			for (const importDescription of module.importDescriptions.values()) {
				if (
					importDescription.name !== '*' &&
					!importDescription.module.getVariableForExportName(importDescription.name)[0]
				) {
					module.log(
						LOGLEVEL_WARN,
						logMissingExport(importDescription.name, module.id, importDescription.module.id),
						importDescription.start
					);
				}
			}
		}
	}
}
