import * as acorn from 'acorn';
import ExternalModule from './ExternalModule';
import Module from './Module';
import { ModuleLoader, UnresolvedModule } from './ModuleLoader';
import GlobalScope from './ast/scopes/GlobalScope';
import { PathTracker } from './ast/utils/PathTracker';
import {
	ModuleInfo,
	ModuleJSON,
	NormalizedInputOptions,
	RollupCache,
	RollupWatcher,
	SerializablePluginCache,
	WatchChangeHook
} from './rollup/types';
import { PluginDriver } from './utils/PluginDriver';
import { BuildPhase } from './utils/buildPhase';
import { errImplicitDependantIsNotIncluded, error } from './utils/error';
import { analyseModuleExecution } from './utils/executionOrder';
import { addAnnotations } from './utils/pureComments';
import relativeId from './utils/relativeId';
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
	readonly acornParser: typeof acorn.Parser;
	readonly cachedModules = new Map<string, ModuleJSON>();
	readonly deoptimizationTracker = new PathTracker();
	entryModules: Module[] = [];
	readonly moduleLoader: ModuleLoader;
	readonly modulesById = new Map<string, Module | ExternalModule>();
	needsTreeshakingPass = false;
	phase: BuildPhase = BuildPhase.LOAD_AND_PARSE;
	readonly pluginDriver: PluginDriver;
	readonly scope = new GlobalScope();
	readonly watchFiles: Record<string, true> = Object.create(null);
	watchMode = false;

	private readonly externalModules: ExternalModule[] = [];
	private implicitEntryModules: Module[] = [];
	private modules: Module[] = [];
	private declare pluginCache?: Record<string, SerializablePluginCache>;

	constructor(private readonly options: NormalizedInputOptions, watcher: RollupWatcher | null) {
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
			const handleChange: WatchChangeHook = (...args) =>
				this.pluginDriver.hookSeqSync('watchChange', args);
			const handleClose = () => this.pluginDriver.hookSeqSync('closeWatcher', []);
			watcher.on('change', handleChange);
			watcher.on('close', handleClose);
			watcher.once('restart', () => {
				watcher.removeListener('change', handleChange);
				watcher.removeListener('close', handleClose);
			});
		}
		this.pluginDriver = new PluginDriver(this, options, options.plugins, this.pluginCache);
		this.acornParser = acorn.Parser.extend(...(options.acornInjectPlugins as any));
		this.moduleLoader = new ModuleLoader(this, this.modulesById, this.options, this.pluginDriver);
	}

	async build(): Promise<void> {
		timeStart('generate module graph', 2);
		await this.generateModuleGraph();
		timeEnd('generate module graph', 2);

		timeStart('sort modules', 2);
		this.phase = BuildPhase.ANALYSE;
		this.sortModules();
		timeEnd('sort modules', 2);

		timeStart('mark included statements', 2);
		this.includeStatements();
		timeEnd('mark included statements', 2);

		this.phase = BuildPhase.GENERATE;
	}

	contextParse(code: string, options: Partial<acorn.Options> = {}): acorn.Node {
		const onCommentOrig = options.onComment;
		const comments: acorn.Comment[] = [];

		if (onCommentOrig && typeof onCommentOrig == 'function') {
			options.onComment = (block, text, start, end, ...args) => {
				comments.push({ end, start, type: block ? 'Block' : 'Line', value: text });
				return onCommentOrig.call(options, block, text, start, end, ...args);
			};
		} else {
			options.onComment = comments;
		}

		const ast = this.acornParser.parse(code, {
			...(this.options.acorn as unknown as acorn.Options),
			...options
		});

		if (typeof onCommentOrig == 'object') {
			onCommentOrig.push(...comments);
		}

		options.onComment = onCommentOrig;

		addAnnotations(comments, ast, code);

		return ast;
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
			if (module instanceof Module) {
				this.modules.push(module);
			} else {
				this.externalModules.push(module);
			}
		}
	}

	private includeStatements(): void {
		for (const module of [...this.entryModules, ...this.implicitEntryModules]) {
			markModuleAndImpureDependenciesAsExecuted(module);
		}
		if (this.options.treeshake) {
			let treeshakingPass = 1;
			do {
				timeStart(`treeshaking pass ${treeshakingPass}`, 3);
				this.needsTreeshakingPass = false;
				for (const module of this.modules) {
					if (module.isExecuted) {
						if (module.info.hasModuleSideEffects === 'no-treeshake') {
							module.includeAllInBundle();
						} else {
							module.include();
						}
					}
				}
				if (treeshakingPass === 1) {
					// We only include exports after the first pass to avoid issues with
					// the TDZ detection logic
					for (const module of [...this.entryModules, ...this.implicitEntryModules]) {
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
					error(errImplicitDependantIsNotIncluded(dependant));
				}
			}
		}
	}

	private sortModules(): void {
		const { orderedModules, cyclePaths } = analyseModuleExecution(this.entryModules);
		for (const cyclePath of cyclePaths) {
			this.options.onwarn({
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

	private warnForMissingExports(): void {
		for (const module of this.modules) {
			for (const importDescription of Object.values(module.importDescriptions)) {
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
