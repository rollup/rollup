import { EventEmitter } from 'events';
import { version as rollupVersion } from 'package.json';
import ExternalModule from '../ExternalModule';
import Graph from '../Graph';
import Module from '../Module';
import {
	EmitAsset,
	EmitChunk,
	InputOptions,
	Plugin,
	PluginCache,
	PluginContext,
	PluginHooks,
	RollupWarning,
	RollupWatcher,
	SerializablePluginCache
} from '../rollup/types';
import { createAssetPluginHooks } from './assetHooks';
import { BuildPhase } from './buildPhase';
import { getRollupDefaultPlugin } from './defaultPlugin';
import {
	errInvalidRollupPhaseForAddWatchFile,
	errInvalidRollupPhaseForEmitChunk,
	error
} from './error';

type Args<T> = T extends (...args: infer K) => any ? K : never;
type EnsurePromise<T> = Promise<T extends Promise<infer K> ? K : T>;

export interface PluginDriver {
	emitAsset: EmitAsset;
	emitChunk: EmitChunk;
	hasLoadersOrTransforms: boolean;
	getAssetFileName(assetReferenceId: string): string;
	hookFirst<H extends keyof PluginHooks, R = ReturnType<PluginHooks[H]>>(
		hook: H,
		args: Args<PluginHooks[H]>,
		hookContext?: HookContext | null,
		skip?: number | null
	): EnsurePromise<R>;
	hookFirstSync<H extends keyof PluginHooks, R = ReturnType<PluginHooks[H]>>(
		hook: H,
		args: Args<PluginHooks[H]>,
		hookContext?: HookContext
	): R;
	hookParallel<H extends keyof PluginHooks>(
		hook: H,
		args: Args<PluginHooks[H]>,
		hookContext?: HookContext
	): Promise<void>;
	hookReduceArg0<H extends keyof PluginHooks, V, R = ReturnType<PluginHooks[H]>>(
		hook: H,
		args: any[],
		reduce: Reduce<V, R>,
		hookContext?: HookContext
	): EnsurePromise<R>;
	hookReduceArg0Sync<H extends keyof PluginHooks, V, R = ReturnType<PluginHooks[H]>>(
		hook: H,
		args: any[],
		reduce: Reduce<V, R>,
		hookContext?: HookContext
	): R;
	hookReduceValue<R = any, T = any>(
		hook: string,
		value: T | Promise<T>,
		args: any[],
		reduce: Reduce<R, T>,
		hookContext?: HookContext
	): Promise<T>;
	hookSeq<H extends keyof PluginHooks>(
		hook: H,
		args: Args<PluginHooks[H]>,
		context?: HookContext
	): Promise<void>;
	hookSeqSync<H extends keyof PluginHooks>(
		hook: H,
		args: Args<PluginHooks[H]>,
		context?: HookContext
	): void;
}

export type Reduce<R = any, T = any> = (reduction: T, result: R, plugin: Plugin) => T;
export type HookContext = (context: PluginContext, plugin?: Plugin) => PluginContext;

export const ANONYMOUS_PLUGIN_PREFIX = 'at position ';

const deprecatedHooks: { active: boolean; deprecated: string; replacement: string }[] = [
	{ active: true, deprecated: 'ongenerate', replacement: 'generateBundle' },
	{ active: true, deprecated: 'onwrite', replacement: 'generateBundle or writeBundle' },
	{ active: true, deprecated: 'transformBundle', replacement: 'renderChunk' },
	{ active: true, deprecated: 'transformChunk', replacement: 'renderChunk' },
	{ active: false, deprecated: 'resolveAssetUrl', replacement: 'resolveFileUrl' }
];

function warnDeprecatedHooks(plugins: Plugin[], graph: Graph) {
	for (const { active, deprecated, replacement } of deprecatedHooks) {
		for (const plugin of plugins) {
			if (deprecated in plugin) {
				graph.warnDeprecation(
					{
						message: `The ${deprecated} hook used by plugin ${plugin.name} is deprecated. The ${replacement} hook should be used instead.`,
						plugin: plugin.name
					},
					active
				);
			}
		}
	}
}

export function createPluginDriver(
	graph: Graph,
	options: InputOptions,
	pluginCache: Record<string, SerializablePluginCache> | void,
	watcher?: RollupWatcher
): PluginDriver {
	warnDeprecatedHooks(options.plugins as Plugin[], graph);
	const plugins = [
		...(options.plugins as Plugin[]),
		getRollupDefaultPlugin(options.preserveSymlinks as boolean)
	];
	const { emitAsset, getAssetFileName, setAssetSource } = createAssetPluginHooks(graph.assetsById);
	const existingPluginKeys = new Set<string>();
	let hasLoadersOrTransforms = false;

	const pluginContexts: PluginContext[] = plugins.map((plugin, pidx) => {
		let cacheable = true;
		if (typeof plugin.cacheKey !== 'string') {
			if (plugin.name.startsWith(ANONYMOUS_PLUGIN_PREFIX) || existingPluginKeys.has(plugin.name)) {
				cacheable = false;
			} else {
				existingPluginKeys.add(plugin.name);
			}
		}

		if (
			!hasLoadersOrTransforms &&
			(plugin.load || plugin.transform || plugin.transformBundle || plugin.transformChunk)
		)
			hasLoadersOrTransforms = true;

		let cacheInstance: PluginCache;
		if (!pluginCache) {
			cacheInstance = noCache;
		} else if (cacheable) {
			const cacheKey = plugin.cacheKey || plugin.name;
			cacheInstance = createPluginCache(
				pluginCache[cacheKey] || (pluginCache[cacheKey] = Object.create(null))
			);
		} else {
			cacheInstance = uncacheablePlugin(plugin.name);
		}

		let watcherDeprecationWarningShown = false;

		function deprecatedWatchListener(event: string, handler: () => void): EventEmitter {
			if (!watcherDeprecationWarningShown) {
				context.warn({
					code: 'PLUGIN_WATCHER_DEPRECATED',
					message: `this.watcher usage is deprecated in plugins. Use the watchChange plugin hook and this.addWatchFile() instead.`
				});
				watcherDeprecationWarningShown = true;
			}
			return (watcher as RollupWatcher).on(event, handler);
		}

		const context: PluginContext = {
			addWatchFile(id) {
				if (graph.phase >= BuildPhase.GENERATE) this.error(errInvalidRollupPhaseForAddWatchFile());
				graph.watchFiles[id] = true;
			},
			cache: cacheInstance,
			emitAsset,
			emitChunk(id, options) {
				if (graph.phase > BuildPhase.LOAD_AND_PARSE)
					this.error(errInvalidRollupPhaseForEmitChunk());
				return pluginDriver.emitChunk(id, options);
			},
			error(err): never {
				if (typeof err === 'string') err = { message: err };
				if (err.code) err.pluginCode = err.code;
				err.code = 'PLUGIN_ERROR';
				err.plugin = plugin.name;
				return error(err);
			},
			isExternal(id, parentId, isResolved = false) {
				return graph.moduleLoader.isExternal(id, parentId, isResolved);
			},
			getAssetFileName: getAssetFileName as (assetId: string) => string,
			getChunkFileName(chunkReferenceId) {
				return graph.moduleLoader.getChunkFileName(chunkReferenceId);
			},
			getModuleInfo(moduleId) {
				const foundModule = graph.moduleById.get(moduleId);
				if (foundModule == null) {
					throw new Error(`Unable to find module ${moduleId}`);
				}

				return {
					hasModuleSideEffects: foundModule.moduleSideEffects,
					id: foundModule.id,
					importedIds:
						foundModule instanceof ExternalModule
							? []
							: foundModule.sources.map(id => foundModule.resolvedIds[id].id),
					isEntry: foundModule instanceof Module && foundModule.isEntryPoint,
					isExternal: foundModule instanceof ExternalModule
				};
			},
			meta: {
				rollupVersion
			},
			get moduleIds() {
				return graph.moduleById.keys();
			},
			parse: graph.contextParse,
			resolveId(source, importer) {
				return graph.moduleLoader
					.resolveId(source, importer)
					.then(resolveId => resolveId && resolveId.id);
			},
			resolve(source, importer, options?: { skipSelf: boolean }) {
				return graph.moduleLoader.resolveId(
					source,
					importer,
					options && options.skipSelf ? pidx : null
				);
			},
			setAssetSource,
			warn(warning) {
				if (typeof warning === 'string') warning = { message: warning } as RollupWarning;
				if (warning.code) warning.pluginCode = warning.code;
				warning.code = 'PLUGIN_WARNING';
				warning.plugin = plugin.name;
				graph.warn(warning);
			},
			watcher: watcher
				? ({
						...(watcher as EventEmitter),
						addListener: deprecatedWatchListener,
						on: deprecatedWatchListener
				  } as EventEmitter)
				: (undefined as any)
		};
		return context;
	});

	function runHookSync<T>(
		hookName: string,
		args: any[],
		pluginIndex: number,
		permitValues = false,
		hookContext?: HookContext
	): T {
		const plugin = plugins[pluginIndex];
		let context = pluginContexts[pluginIndex];
		const hook = (plugin as any)[hookName];
		if (!hook) return undefined as any;

		if (hookContext) {
			context = hookContext(context, plugin);
			if (!context || context === pluginContexts[pluginIndex])
				throw new Error('Internal Rollup error: hookContext must return a new context object.');
		}
		try {
			// permit values allows values to be returned instead of a functional hook
			if (typeof hook !== 'function') {
				if (permitValues) return hook;
				error({
					code: 'INVALID_PLUGIN_HOOK',
					message: `Error running plugin hook ${hookName} for ${plugin.name}, expected a function hook.`
				});
			}
			return hook.apply(context, args);
		} catch (err) {
			if (typeof err === 'string') err = { message: err };
			if (err.code !== 'PLUGIN_ERROR') {
				if (err.code) err.pluginCode = err.code;
				err.code = 'PLUGIN_ERROR';
			}
			err.plugin = plugin.name;
			err.hook = hookName;
			error(err);
		}
		return undefined as any;
	}

	function runHook<T>(
		hookName: string,
		args: any[],
		pluginIndex: number,
		permitValues = false,
		hookContext?: HookContext | null
	): Promise<T> {
		const plugin = plugins[pluginIndex];
		let context = pluginContexts[pluginIndex];
		const hook = (plugin as any)[hookName];
		if (!hook) return undefined as any;

		if (hookContext) {
			context = hookContext(context, plugin);
			if (!context || context === pluginContexts[pluginIndex])
				throw new Error('Internal Rollup error: hookContext must return a new context object.');
		}
		return Promise.resolve()
			.then(() => {
				// permit values allows values to be returned instead of a functional hook
				if (typeof hook !== 'function') {
					if (permitValues) return hook;
					error({
						code: 'INVALID_PLUGIN_HOOK',
						message: `Error running plugin hook ${hookName} for ${plugin.name}, expected a function hook.`
					});
				}
				return hook.apply(context, args);
			})
			.catch(err => {
				if (typeof err === 'string') err = { message: err };
				if (err.code !== 'PLUGIN_ERROR') {
					if (err.code) err.pluginCode = err.code;
					err.code = 'PLUGIN_ERROR';
				}
				err.plugin = plugin.name;
				err.hook = hookName;
				error(err);
			});
	}

	const pluginDriver: PluginDriver = {
		emitAsset,
		emitChunk(id, options) {
			return graph.moduleLoader.addEntryModuleAndGetReferenceId({
				alias: (options && options.name) || null,
				unresolvedId: id
			});
		},
		getAssetFileName: getAssetFileName as (assetId: string) => string,
		hasLoadersOrTransforms,

		// chains, ignores returns
		hookSeq(name, args, hookContext) {
			let promise: Promise<void> = Promise.resolve() as any;
			for (let i = 0; i < plugins.length; i++)
				promise = promise.then(() => runHook<void>(name, args as any[], i, false, hookContext));
			return promise;
		},

		// chains, ignores returns
		hookSeqSync(name, args, hookContext) {
			for (let i = 0; i < plugins.length; i++)
				runHookSync<void>(name, args as any[], i, false, hookContext);
		},

		// chains, first non-null result stops and returns
		hookFirst(name, args, hookContext, skip) {
			let promise: Promise<any> = Promise.resolve();
			for (let i = 0; i < plugins.length; i++) {
				if (skip === i) continue;
				promise = promise.then((result: any) => {
					if (result != null) return result;
					return runHook(name, args as any[], i, false, hookContext);
				});
			}
			return promise;
		},

		// chains synchronously, first non-null result stops and returns
		hookFirstSync(name, args?, hookContext?) {
			for (let i = 0; i < plugins.length; i++) {
				const result = runHookSync(name, args, i, false, hookContext);
				if (result != null) return result as any;
			}
			return null;
		},

		// parallel, ignores returns
		hookParallel(name, args, hookContext) {
			const promises: Promise<void>[] = [];
			for (let i = 0; i < plugins.length; i++) {
				const hookPromise = runHook<void>(name, args as any[], i, false, hookContext);
				if (!hookPromise) continue;
				promises.push(hookPromise);
			}
			return Promise.all(promises).then(() => {});
		},

		// chains, reduces returns of type R, to type T, handling the reduced value as the first hook argument
		hookReduceArg0(name, [arg0, ...args], reduce, hookContext) {
			let promise = Promise.resolve(arg0);
			for (let i = 0; i < plugins.length; i++) {
				promise = promise.then(arg0 => {
					const hookPromise = runHook(name, [arg0, ...args], i, false, hookContext);
					if (!hookPromise) return arg0;
					return hookPromise.then((result: any) =>
						reduce.call(pluginContexts[i], arg0, result, plugins[i])
					);
				});
			}
			return promise;
		},

		// chains synchronously, reduces returns of type R, to type T, handling the reduced value as the first hook argument
		hookReduceArg0Sync(name, [arg0, ...args], reduce, hookContext) {
			for (let i = 0; i < plugins.length; i++) {
				const result: any = runHookSync(name, [arg0, ...args], i, false, hookContext);
				arg0 = reduce.call(pluginContexts[i], arg0, result, plugins[i]);
			}
			return arg0;
		},

		// chains, reduces returns of type R, to type T, handling the reduced value separately. permits hooks as values.
		hookReduceValue(name, initial, args, reduce, hookContext) {
			let promise = Promise.resolve(initial);
			for (let i = 0; i < plugins.length; i++) {
				promise = promise.then(value => {
					const hookPromise = runHook(name, args, i, true, hookContext);
					if (!hookPromise) return value;
					return hookPromise.then((result: any) =>
						reduce.call(pluginContexts[i], value, result, plugins[i])
					);
				});
			}
			return promise;
		}
	};

	return pluginDriver;
}

export function createPluginCache(cache: SerializablePluginCache): PluginCache {
	return {
		has(id: string) {
			const item = cache[id];
			if (!item) return false;
			item[0] = 0;
			return true;
		},
		get(id: string) {
			const item = cache[id];
			if (!item) return undefined;
			item[0] = 0;
			return item[1];
		},
		set(id: string, value: any) {
			cache[id] = [0, value];
		},
		delete(id: string) {
			return delete cache[id];
		}
	};
}

export function trackPluginCache(pluginCache: PluginCache) {
	const result = { used: false, cache: (undefined as any) as PluginCache };
	result.cache = {
		has(id: string) {
			result.used = true;
			return pluginCache.has(id);
		},
		get(id: string) {
			result.used = true;
			return pluginCache.get(id);
		},
		set(id: string, value: any) {
			result.used = true;
			return pluginCache.set(id, value);
		},
		delete(id: string) {
			result.used = true;
			return pluginCache.delete(id);
		}
	};
	return result;
}

const noCache: PluginCache = {
	has() {
		return false;
	},
	get() {
		return undefined as any;
	},
	set() {},
	delete() {
		return false;
	}
};

function uncacheablePluginError(pluginName: string) {
	if (pluginName.startsWith(ANONYMOUS_PLUGIN_PREFIX))
		error({
			code: 'ANONYMOUS_PLUGIN_CACHE',
			message:
				'A plugin is trying to use the Rollup cache but is not declaring a plugin name or cacheKey.'
		});
	else
		error({
			code: 'DUPLICATE_PLUGIN_NAME',
			message: `The plugin name ${pluginName} is being used twice in the same build. Plugin names must be distinct or provide a cacheKey (please post an issue to the plugin if you are a plugin user).`
		});
}

const uncacheablePlugin: (pluginName: string) => PluginCache = pluginName => ({
	has() {
		uncacheablePluginError(pluginName);
		return false;
	},
	get() {
		uncacheablePluginError(pluginName);
		return undefined as any;
	},
	set() {
		uncacheablePluginError(pluginName);
	},
	delete() {
		uncacheablePluginError(pluginName);
		return false;
	}
});
