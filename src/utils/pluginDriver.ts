import Graph from '../Graph';
import {
	InputOptions,
	Plugin,
	PluginContext,
	RollupError,
	RollupWarning,
	Watcher
} from '../rollup/types';
import { createAssetPluginHooks, EmitAsset } from './assetHooks';
import { getRollupDefaultPlugin } from './default-plugin';
import error from './error';

export interface PluginDriver {
	emitAsset: EmitAsset;
	getAssetFileName(assetId: string): string;
	hookSeq(hook: string, args?: any[], context?: HookContext): Promise<void>;
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

export function createPluginDriver(
	graph: Graph,
	options: InputOptions,
	watcher?: Watcher
): PluginDriver {
	const plugins = [...(options.plugins || []), getRollupDefaultPlugin(options)];
	const { emitAsset, getAssetFileName, setAssetSource } = createAssetPluginHooks(graph.assetsById);

	let hasLoadersOrTransforms = false;

	const pluginContexts = plugins.map(plugin => {
		if (
			!hasLoadersOrTransforms &&
			(plugin.load || plugin.transform || plugin.transformBundle || plugin.transformChunk)
		)
			hasLoadersOrTransforms = true;

		const context: PluginContext = {
			watcher,
			isExternal(id: string, parentId: string, isResolved = false) {
				return graph.isExternal(id, parentId, isResolved);
			},
			resolveId(id: string, parent: string) {
				return pluginDriver.hookFirst('resolveId', [id, parent]);
			},
			parse: graph.contextParse,
			emitAsset,
			getAssetFileName,
			setAssetSource,

			warn: (warning: RollupWarning | string) => {
				if (typeof warning === 'string') warning = { message: warning };
				if (warning.code) warning.pluginCode = warning.code;
				warning.code = 'PLUGIN_WARNING';
				warning.plugin = plugin.name || '(anonymous plugin)';
				graph.warn(warning);
			},
			error: (err: RollupError | string) => {
				if (typeof err === 'string') err = { message: err };
				if (err.code) err.pluginCode = err.code;
				err.code = 'PLUGIN_ERROR';
				err.plugin = plugin.name || '(anonymous plugin)';
				error(err);
			}
		};
		return context;
	});

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
							`Plugin at pos ${pidx + 1}`}, expected a function hook.`
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
				err.plugin = plugin.name || `Plugin at pos ${pidx}`;
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
						return reduce(arg0, result, plugins[i]);
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
						return reduce(value, result, plugins[i]);
					});
				});
			}
			return promise;
		}
	};

	return pluginDriver;
}
