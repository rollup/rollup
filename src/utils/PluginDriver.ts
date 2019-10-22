import Graph from '../Graph';
import {
	EmitFile,
	InputOptions,
	OutputBundleWithPlaceholders,
	Plugin,
	PluginContext,
	PluginHooks,
	RollupWatcher,
	SerializablePluginCache
} from '../rollup/types';
import { getRollupDefaultPlugin } from './defaultPlugin';
import { error } from './error';
import { FileEmitter } from './FileEmitter';
import { getPluginContexts } from './PluginContext';
import { throwPluginError } from './pluginUtils';

type Args<T> = T extends (...args: infer K) => any ? K : never;
type EnsurePromise<T> = Promise<T extends Promise<infer K> ? K : T>;

export interface PluginDriver {
	emitFile: EmitFile;
	finaliseAssets(): void;
	getFileName(assetReferenceId: string): string;
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
	hookReduceValueSync<R = any, T = any>(
		hook: string,
		value: T,
		args: any[],
		reduce: Reduce<R, T>,
		hookContext?: HookContext
	): T;
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
	startOutput(outputBundle: OutputBundleWithPlaceholders, assetFileNames: string): void;
}

export type Reduce<R = any, T = any> = (reduction: T, result: R, plugin: Plugin) => T;
export type HookContext = (context: PluginContext, plugin: Plugin) => PluginContext;

export const deprecatedHooks: { active: boolean; deprecated: string; replacement: string }[] = [
	{ active: true, deprecated: 'ongenerate', replacement: 'generateBundle' },
	{ active: true, deprecated: 'onwrite', replacement: 'generateBundle/writeBundle' },
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
						message: `The "${deprecated}" hook used by plugin ${plugin.name} is deprecated. The "${replacement}" hook should be used instead.`,
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
	const fileEmitter = new FileEmitter(graph);

	const pluginContexts: PluginContext[] = plugins.map(
		getPluginContexts(pluginCache, graph, fileEmitter, watcher)
	);

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
			return throwPluginError(err, plugin.name, { hook: hookName });
		}
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
			.catch(err => throwPluginError(err, plugin.name, { hook: hookName }));
	}

	return {
		emitFile: fileEmitter.emitFile,
		finaliseAssets() {
			fileEmitter.assertAssetsFinalized();
		},
		getFileName: fileEmitter.getFileName,

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
		},

		// chains, reduces returns of type R, to type T, handling the reduced value separately. permits hooks as values.
		hookReduceValueSync(name, initial, args, reduce, hookContext) {
			let acc = initial;
			for (let i = 0; i < plugins.length; i++) {
				const result: any = runHookSync(name, args, i, true, hookContext);
				acc = reduce.call(pluginContexts[i], acc, result, plugins[i]);
			}
			return acc;
		},

		startOutput(outputBundle: OutputBundleWithPlaceholders, assetFileNames: string): void {
			fileEmitter.startOutput(outputBundle, assetFileNames);
		}
	};
}
