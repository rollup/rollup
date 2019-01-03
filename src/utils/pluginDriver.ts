import { EventEmitter } from 'events';
import { version as rollupVersion } from 'package.json';
import Graph from '../Graph';
import Module from '../Module';
import {
	InputOptions,
	Plugin,
	PluginCache,
	PluginContext,
	RollupError,
	RollupWarning,
	RollupWatcher,
	SerializablePluginCache
} from '../rollup/types';
import { createAssetPluginHooks, EmitAsset } from './assetHooks';
import { getRollupDefaultPlugin } from './defaultPlugin';
import { error } from './error';

export interface PluginDriver {
	emitAsset: EmitAsset;
	getAssetFileName(assetId: string): string;
	hookSeq(hook: string, args?: any[], context?: HookContext): Promise<void>;
	hookSeqSync(hook: string, args?: any[], context?: HookContext): void;
	hookFirst<T = any>(hook: string, args?: any[], hookContext?: HookContext): Promise<T>;
	hookParallel(hook: string, args?: any[], hookContext?: HookContext): Promise<void>;
	hookReduceArg0<R = any, T = any>(
		hook: string,
		args: any[],
		reduce: Reduce<R, T>,
		hookContext?: HookContext
	): Promise<T>;
	hookReduceValue<R = any, T = any>(
		hook: string,
		value: T | Promise<T>,
		args: any[],
		reduce: Reduce<R, T>,
		hookContext?: HookContext
	): Promise<T>;
	hasLoadersOrTransforms: boolean;
}

export type Reduce<R = any, T = any> = (reduction: T, result: R, plugin: Plugin) => T;
export type HookContext = (context: PluginContext, plugin?: Plugin) => PluginContext;

const deprecatedHookNames: Record<string, string> = {
	transformBundle: 'renderChunk',
	transformChunk: 'renderChunk',
	ongenerate: 'generateBundle',
	onwrite: 'generateBundle'
};

export function createPluginDriver(
	graph: Graph,
	options: InputOptions,
	pluginCache: Record<string, SerializablePluginCache>,
	watcher?: RollupWatcher
): PluginDriver {
	const plugins = [...(options.plugins || []), getRollupDefaultPlugin(options)];
	const { emitAsset, getAssetFileName, setAssetSource } = createAssetPluginHooks(graph.assetsById);
	const existingPluginKeys: { [key: string]: true } = {};

	let hasLoadersOrTransforms = false;

	const pluginContexts: PluginContext[] = plugins.map((plugin, pidx) => {
		let cacheable = true;
		if (typeof plugin.cacheKey !== 'string') {
			if (typeof plugin.name !== 'string' || existingPluginKeys[plugin.name]) {
				cacheable = false;
			} else {
				existingPluginKeys[plugin.name] = true;
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
			return watcher.on(event, handler);
		}

		const context: PluginContext = {
			addWatchFile(id: string) {
				if (graph.finished) this.error('addWatchFile can only be called during the build.');
				graph.watchFiles[id] = true;
			},
			cache: cacheInstance,
			emitAsset,
			error: (err: RollupError | string) => {
				if (typeof err === 'string') err = { message: err };
				if (err.code) err.pluginCode = err.code;
				err.code = 'PLUGIN_ERROR';
				err.plugin = plugin.name || `Plugin at position ${pidx + 1}`;
				error(err);
			},
			isExternal(id: string, parentId: string, isResolved = false) {
				return graph.isExternal(id, parentId, isResolved);
			},
			getAssetFileName,
			meta: {
				rollupVersion
			},
			parse: graph.contextParse,
			resolveId(id: string, parent: string) {
				return pluginDriver.hookFirst('resolveId', [id, parent]);
			},
			setAssetSource,
			warn: (warning: RollupWarning | string) => {
				if (typeof warning === 'string') warning = { message: warning } as RollupWarning;
				if (warning.code) warning.pluginCode = warning.code;
				warning.code = 'PLUGIN_WARNING';
				warning.plugin = plugin.name || `Plugin at position ${pidx + 1}`;
				graph.warn(warning);
			},
			moduleIds: graph.moduleById.keys(),
			getModuleInfo: (moduleId: string) => {
				const foundModule = graph.moduleById.get(moduleId);
				if (foundModule == null) {
					throw new Error(`Unable to find module ${moduleId}`);
				}

				return {
					id: foundModule.id,
					isExternal: !!foundModule.isExternal,
					importedIds: foundModule.isExternal
						? []
						: (foundModule as Module).sources.map(id => (foundModule as Module).resolvedIds[id])
				};
			},
			watcher: watcher
				? <EventEmitter>{
						...(<EventEmitter>watcher),
						on: deprecatedWatchListener,
						addListener: deprecatedWatchListener
				  }
				: undefined
		};
		return context;
	});

	function runHookSync<T>(
		hookName: string,
		args: any[],
		pidx: number,
		permitValues = false,
		hookContext?: HookContext
	): Promise<T> {
		const plugin = plugins[pidx];
		let context = pluginContexts[pidx];
		const hook = (<any>plugin)[hookName];
		if (!hook) return;

		const deprecatedHookNewName = deprecatedHookNames[hookName];
		if (deprecatedHookNewName)
			context.warn(hookDeprecationWarning(hookName, deprecatedHookNewName, plugin, pidx));

		if (hookContext) {
			context = hookContext(context, plugin);
			if (!context || context === pluginContexts[pidx])
				throw new Error('Internal Rollup error: hookContext must return a new context object.');
		}
		try {
			// permit values allows values to be returned instead of a functional hook
			if (typeof hook !== 'function') {
				if (permitValues) return hook;
				error({
					code: 'INVALID_PLUGIN_HOOK',
					message: `Error running plugin hook ${hookName} for ${plugin.name ||
						`Plugin at position ${pidx + 1}`}, expected a function hook.`
				});
			}
			return hook.apply(context, args);
		} catch (err) {
			if (typeof err === 'string') err = { message: err };
			if (err.code !== 'PLUGIN_ERROR') {
				if (err.code) err.pluginCode = err.code;
				err.code = 'PLUGIN_ERROR';
			}
			err.plugin = plugin.name || `Plugin at position ${pidx + 1}`;
			err.hook = hookName;
			error(err);
		}
	}

	function runHook<T>(
		hookName: string,
		args: any[],
		pidx: number,
		permitValues = false,
		hookContext?: HookContext
	): Promise<T> {
		const plugin = plugins[pidx];
		let context = pluginContexts[pidx];
		const hook = (<any>plugin)[hookName];
		if (!hook) return;

		const deprecatedHookNewName = deprecatedHookNames[hookName];
		if (deprecatedHookNewName)
			context.warn(hookDeprecationWarning(hookName, deprecatedHookNewName, plugin, pidx));

		if (hookContext) {
			context = hookContext(context, plugin);
			if (!context || context === pluginContexts[pidx])
				throw new Error('Internal Rollup error: hookContext must return a new context object.');
		}
		return Promise.resolve()
			.then(() => {
				// permit values allows values to be returned instead of a functional hook
				if (typeof hook !== 'function') {
					if (permitValues) return hook;
					error({
						code: 'INVALID_PLUGIN_HOOK',
						message: `Error running plugin hook ${hookName} for ${plugin.name ||
							`Plugin at position ${pidx + 1}`}, expected a function hook.`
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
				err.plugin = plugin.name || `Plugin at position ${pidx + 1}`;
				err.hook = hookName;
				error(err);
			});
	}

	const pluginDriver: PluginDriver = {
		emitAsset,
		getAssetFileName,
		hasLoadersOrTransforms,

		// chains, ignores returns
		hookSeq(name, args, hookContext) {
			let promise: Promise<void> = <any>Promise.resolve();
			for (let i = 0; i < plugins.length; i++)
				promise = promise.then(() => {
					return runHook<void>(name, args, i, false, hookContext);
				});
			return promise;
		},

		// chains, ignores returns
		hookSeqSync(name, args, hookContext) {
			for (let i = 0; i < plugins.length; i++) runHookSync<void>(name, args, i, false, hookContext);
		},

		// chains, first non-null result stops and returns
		hookFirst(name, args, hookContext) {
			let promise: Promise<any> = Promise.resolve();
			for (let i = 0; i < plugins.length; i++) {
				promise = promise.then((result: any) => {
					if (result != null) return result;
					return runHook(name, args, i, false, hookContext);
				});
			}
			return promise;
		},
		// parallel, ignores returns
		hookParallel(name, args, hookContext) {
			const promises: Promise<void>[] = [];
			for (let i = 0; i < plugins.length; i++) {
				const hookPromise = runHook<void>(name, args, i, false, hookContext);
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
					return hookPromise.then((result: any) => {
						return reduce.call(pluginContexts[i], arg0, result, plugins[i]);
					});
				});
			}
			return promise;
		},
		// chains, reduces returns of type R, to type T, handling the reduced value separately. permits hooks as values.
		hookReduceValue(name, initial, args, reduce, hookContext) {
			let promise = Promise.resolve(initial);
			for (let i = 0; i < plugins.length; i++) {
				promise = promise.then(value => {
					const hookPromise = runHook(name, args, i, true, hookContext);
					if (!hookPromise) return value;
					return hookPromise.then((result: any) => {
						return reduce.call(pluginContexts[i], value, result, plugins[i]);
					});
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
	const result = { used: false, cache: <PluginCache>undefined };
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
		return undefined;
	},
	set() {},
	delete() {
		return false;
	}
};

function uncacheablePluginError(pluginName: string) {
	if (!pluginName)
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
		return undefined;
	},
	set() {
		uncacheablePluginError(pluginName);
	},
	delete() {
		uncacheablePluginError(pluginName);
		return false;
	}
});

function hookDeprecationWarning(name: string, newName: string, plugin: Plugin, pidx: number) {
	return {
		code: name.toUpperCase() + '_HOOK_DEPRECATED',
		message: `The ${name} hook used by plugin ${plugin.name ||
			`at position ${pidx + 1}`} is deprecated. The ${newName} hook should be used instead.`
	};
}
