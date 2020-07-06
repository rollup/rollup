import Chunk from '../Chunk';
import Graph from '../Graph';
import Module from '../Module';
import {
	AddonHookFunction,
	AsyncPluginHooks,
	EmitFile,
	FirstPluginHooks,
	NormalizedInputOptions,
	OutputBundleWithPlaceholders,
	OutputPluginHooks,
	ParallelPluginHooks,
	Plugin,
	PluginContext,
	PluginHooks,
	PluginValueHooks,
	PreRenderedAsset,
	SequentialPluginHooks,
	SerializablePluginCache,
	SyncPluginHooks
} from '../rollup/types';
import { errInputHookInOutputPlugin, error } from './error';
import { FileEmitter } from './FileEmitter';
import { getPluginContexts } from './PluginContext';
import { throwPluginError, warnDeprecatedHooks } from './pluginUtils';

/**
 * Get the inner type from a promise
 * @example ResolveValue<Promise<string>> -> string
 */
type ResolveValue<T> = T extends Promise<infer K> ? K : T;
/**
 * Coerce a promise union to always be a promise.
 * @example EnsurePromise<string | Promise<string>> -> Promise<string>
 */
type EnsurePromise<T> = Promise<ResolveValue<T>>;
/**
 * Get the type of the first argument in a function.
 * @example Arg0<(a: string, b: number) => void> -> string
 */
type Arg0<H extends keyof PluginHooks> = Parameters<PluginHooks[H]>[0];

// This will make sure no input hook is omitted
type Subtract<T, U> = T extends U ? never : T;
const inputHookNames: {
	[P in Subtract<keyof PluginHooks, keyof OutputPluginHooks>]: 1;
} = {
	buildEnd: 1,
	buildStart: 1,
	load: 1,
	options: 1,
	resolveDynamicImport: 1,
	resolveId: 1,
	transform: 1,
	watchChange: 1
};
const inputHooks = Object.keys(inputHookNames);

type ReplaceContext = (context: PluginContext, plugin: Plugin) => PluginContext;

function throwInvalidHookError(hookName: string, pluginName: string) {
	return error({
		code: 'INVALID_PLUGIN_HOOK',
		message: `Error running plugin hook ${hookName} for ${pluginName}, expected a function hook.`
	});
}

export class PluginDriver {
	public emitFile: EmitFile;
	public finaliseAssets: () => void;
	public getFileName: (fileReferenceId: string) => string;
	public setOutputBundle: (
		outputBundle: OutputBundleWithPlaceholders,
		assetFileNames: string | ((assetInfo: PreRenderedAsset) => string),
		facadeChunkByModule: Map<Module, Chunk>
	) => void;

	private fileEmitter: FileEmitter;
	private pluginCache: Record<string, SerializablePluginCache> | undefined;
	private pluginContexts: PluginContext[];
	private plugins: Plugin[];

	constructor(
		private readonly graph: Graph,
		private readonly options: NormalizedInputOptions,
		userPlugins: Plugin[],
		pluginCache: Record<string, SerializablePluginCache> | undefined,
		basePluginDriver?: PluginDriver
	) {
		warnDeprecatedHooks(userPlugins, options);
		this.pluginCache = pluginCache;
		this.fileEmitter = new FileEmitter(
			graph,
			options,
			basePluginDriver && basePluginDriver.fileEmitter
		);
		this.emitFile = this.fileEmitter.emitFile;
		this.getFileName = this.fileEmitter.getFileName;
		this.finaliseAssets = this.fileEmitter.assertAssetsFinalized;
		this.setOutputBundle = this.fileEmitter.setOutputBundle;
		this.plugins = userPlugins.concat(basePluginDriver ? basePluginDriver.plugins : []);
		this.pluginContexts = this.plugins.map(
			getPluginContexts(pluginCache, graph, options, this.fileEmitter)
		);
		if (basePluginDriver) {
			for (const plugin of userPlugins) {
				for (const hook of inputHooks) {
					if (hook in plugin) {
						options.onwarn(errInputHookInOutputPlugin(plugin.name, hook));
					}
				}
			}
		}
	}

	public createOutputPluginDriver(plugins: Plugin[]): PluginDriver {
		return new PluginDriver(this.graph, this.options, plugins, this.pluginCache, this);
	}

	// chains, first non-null result stops and returns
	hookFirst<H extends AsyncPluginHooks & FirstPluginHooks>(
		hookName: H,
		args: Parameters<PluginHooks[H]>,
		replaceContext?: ReplaceContext | null,
		skip?: number | null
	): EnsurePromise<ReturnType<PluginHooks[H]>> {
		let promise: EnsurePromise<ReturnType<PluginHooks[H]>> = Promise.resolve(undefined as any);
		for (let i = 0; i < this.plugins.length; i++) {
			if (skip === i) continue;
			promise = promise.then(result => {
				if (result != null) return result;
				return this.runHook(hookName, args, i, false, replaceContext);
			});
		}
		return promise;
	}

	// chains synchronously, first non-null result stops and returns
	hookFirstSync<H extends SyncPluginHooks & FirstPluginHooks>(
		hookName: H,
		args: Parameters<PluginHooks[H]>,
		replaceContext?: ReplaceContext
	): ReturnType<PluginHooks[H]> {
		for (let i = 0; i < this.plugins.length; i++) {
			const result = this.runHookSync(hookName, args, i, replaceContext);
			if (result != null) return result;
		}
		return null as any;
	}

	// parallel, ignores returns
	hookParallel<H extends AsyncPluginHooks & ParallelPluginHooks>(
		hookName: H,
		args: Parameters<PluginHooks[H]>,
		replaceContext?: ReplaceContext
	): Promise<void> {
		const promises: Promise<void>[] = [];
		for (let i = 0; i < this.plugins.length; i++) {
			const hookPromise = this.runHook(hookName, args, i, false, replaceContext);
			if (!hookPromise) continue;
			promises.push(hookPromise);
		}
		return Promise.all(promises).then(() => {});
	}

	// chains, reduces returned value, handling the reduced value as the first hook argument
	hookReduceArg0<H extends AsyncPluginHooks & SequentialPluginHooks>(
		hookName: H,
		[arg0, ...rest]: Parameters<PluginHooks[H]>,
		reduce: (
			reduction: Arg0<H>,
			result: ResolveValue<ReturnType<PluginHooks[H]>>,
			plugin: Plugin
		) => Arg0<H>,
		replaceContext?: ReplaceContext
	): Promise<Arg0<H>> {
		let promise = Promise.resolve(arg0);
		for (let i = 0; i < this.plugins.length; i++) {
			promise = promise.then(arg0 => {
				const args = [arg0, ...rest] as Parameters<PluginHooks[H]>;
				const hookPromise = this.runHook(hookName, args, i, false, replaceContext);
				if (!hookPromise) return arg0;
				return hookPromise.then(result =>
					reduce.call(this.pluginContexts[i], arg0, result, this.plugins[i])
				);
			});
		}
		return promise;
	}

	// chains synchronously, reduces returned value, handling the reduced value as the first hook argument
	hookReduceArg0Sync<H extends SyncPluginHooks & SequentialPluginHooks>(
		hookName: H,
		[arg0, ...rest]: Parameters<PluginHooks[H]>,
		reduce: (reduction: Arg0<H>, result: ReturnType<PluginHooks[H]>, plugin: Plugin) => Arg0<H>,
		replaceContext?: ReplaceContext
	): Arg0<H> {
		for (let i = 0; i < this.plugins.length; i++) {
			const args = [arg0, ...rest] as Parameters<PluginHooks[H]>;
			const result = this.runHookSync(hookName, args, i, replaceContext);
			arg0 = reduce.call(this.pluginContexts[i], arg0, result, this.plugins[i]);
		}
		return arg0;
	}

	// chains, reduces returned value to type T, handling the reduced value separately. permits hooks as values.
	hookReduceValue<H extends PluginValueHooks, T>(
		hookName: H,
		initialValue: T | Promise<T>,
		args: Parameters<AddonHookFunction>,
		reduce: (
			reduction: T,
			result: ResolveValue<ReturnType<AddonHookFunction>>,
			plugin: Plugin
		) => T,
		replaceContext?: ReplaceContext
	): Promise<T> {
		let promise = Promise.resolve(initialValue);
		for (let i = 0; i < this.plugins.length; i++) {
			promise = promise.then(value => {
				const hookPromise = this.runHook(hookName, args, i, true, replaceContext);
				if (!hookPromise) return value;
				return hookPromise.then(result =>
					reduce.call(this.pluginContexts[i], value, result, this.plugins[i])
				);
			});
		}
		return promise;
	}

	// chains synchronously, reduces returned value to type T, handling the reduced value separately. permits hooks as values.
	hookReduceValueSync<H extends SyncPluginHooks & SequentialPluginHooks, T>(
		hookName: H,
		initialValue: T,
		args: Parameters<PluginHooks[H]>,
		reduce: (reduction: T, result: ReturnType<PluginHooks[H]>, plugin: Plugin) => T,
		replaceContext?: ReplaceContext
	): T {
		let acc = initialValue;
		for (let i = 0; i < this.plugins.length; i++) {
			const result = this.runHookSync(hookName, args, i, replaceContext);
			acc = reduce.call(this.pluginContexts[i], acc, result, this.plugins[i]);
		}
		return acc;
	}

	// chains, ignores returns
	hookSeq<H extends AsyncPluginHooks & SequentialPluginHooks>(
		hookName: H,
		args: Parameters<PluginHooks[H]>,
		replaceContext?: ReplaceContext
	): Promise<void> {
		let promise = Promise.resolve();
		for (let i = 0; i < this.plugins.length; i++) {
			promise = promise.then(
				() => this.runHook(hookName, args, i, false, replaceContext) as Promise<void>
			);
		}
		return promise;
	}

	// chains synchronously, ignores returns
	hookSeqSync<H extends SyncPluginHooks & SequentialPluginHooks>(
		hookName: H,
		args: Parameters<PluginHooks[H]>,
		replaceContext?: ReplaceContext
	): void {
		for (let i = 0; i < this.plugins.length; i++) {
			this.runHookSync(hookName, args, i, replaceContext);
		}
	}

	/**
	 * Run an async plugin hook and return the result.
	 * @param hookName Name of the plugin hook. Must be either in `PluginHooks` or `OutputPluginValueHooks`.
	 * @param args Arguments passed to the plugin hook.
	 * @param pluginIndex Index of the plugin inside `this.plugins[]`.
	 * @param permitValues If true, values can be passed instead of functions for the plugin hook.
	 * @param hookContext When passed, the plugin context can be overridden.
	 */
	private runHook<H extends PluginValueHooks>(
		hookName: H,
		args: Parameters<AddonHookFunction>,
		pluginIndex: number,
		permitValues: true,
		hookContext?: ReplaceContext | null
	): EnsurePromise<ReturnType<AddonHookFunction>>;
	private runHook<H extends AsyncPluginHooks>(
		hookName: H,
		args: Parameters<PluginHooks[H]>,
		pluginIndex: number,
		permitValues: false,
		hookContext?: ReplaceContext | null
	): EnsurePromise<ReturnType<PluginHooks[H]>>;
	private runHook<H extends AsyncPluginHooks>(
		hookName: H,
		args: Parameters<PluginHooks[H]>,
		pluginIndex: number,
		permitValues: boolean,
		hookContext?: ReplaceContext | null
	): EnsurePromise<ReturnType<PluginHooks[H]>> {
		const plugin = this.plugins[pluginIndex];
		const hook = plugin[hookName];
		if (!hook) return undefined as any;

		let context = this.pluginContexts[pluginIndex];
		if (hookContext) {
			context = hookContext(context, plugin);
		}

		return Promise.resolve()
			.then(() => {
				// permit values allows values to be returned instead of a functional hook
				if (typeof hook !== 'function') {
					if (permitValues) return hook;
					return throwInvalidHookError(hookName, plugin.name);
				}
				return (hook as Function).apply(context, args);
			})
			.catch(err => throwPluginError(err, plugin.name, { hook: hookName }));
	}

	/**
	 * Run a sync plugin hook and return the result.
	 * @param hookName Name of the plugin hook. Must be in `PluginHooks`.
	 * @param args Arguments passed to the plugin hook.
	 * @param pluginIndex Index of the plugin inside `this.plugins[]`.
	 * @param hookContext When passed, the plugin context can be overridden.
	 */
	private runHookSync<H extends SyncPluginHooks>(
		hookName: H,
		args: Parameters<PluginHooks[H]>,
		pluginIndex: number,
		hookContext?: ReplaceContext
	): ReturnType<PluginHooks[H]> {
		const plugin = this.plugins[pluginIndex];
		const hook = plugin[hookName];
		if (!hook) return undefined as any;

		let context = this.pluginContexts[pluginIndex];
		if (hookContext) {
			context = hookContext(context, plugin);
		}

		try {
			// permit values allows values to be returned instead of a functional hook
			if (typeof hook !== 'function') {
				return throwInvalidHookError(hookName, plugin.name);
			}
			return (hook as Function).apply(context, args);
		} catch (err) {
			return throwPluginError(err, plugin.name, { hook: hookName });
		}
	}
}
