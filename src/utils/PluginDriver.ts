import Chunk from '../Chunk';
import Graph from '../Graph';
import Module from '../Module';
import {
	AddonHookFunction,
	AsyncPluginHooks,
	EmitFile,
	FirstPluginHooks,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	OutputBundleWithPlaceholders,
	OutputPluginHooks,
	ParallelPluginHooks,
	Plugin,
	PluginContext,
	PluginHooks,
	PluginValueHooks,
	SequentialPluginHooks,
	SerializablePluginCache,
	SyncPluginHooks
} from '../rollup/types';
import { FileEmitter } from './FileEmitter';
import { getPluginContext } from './PluginContext';
import { errInputHookInOutputPlugin, error } from './error';
import { addUnresolvedAction, resolveAction } from './hookActions';
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
	closeBundle: 1,
	closeWatcher: 1,
	load: 1,
	moduleParsed: 1,
	options: 1,
	resolveDynamicImport: 1,
	resolveId: 1,
	shouldTransformCachedModule: 1,
	transform: 1,
	watchChange: 1
};
const inputHooks = Object.keys(inputHookNames);

export type ReplaceContext = (context: PluginContext, plugin: Plugin) => PluginContext;

function throwInvalidHookError(hookName: string, pluginName: string) {
	return error({
		code: 'INVALID_PLUGIN_HOOK',
		message: `Error running plugin hook ${hookName} for ${pluginName}, expected a function hook.`
	});
}

export class PluginDriver {
	public readonly emitFile: EmitFile;
	public finaliseAssets: () => void;
	public getFileName: (fileReferenceId: string) => string;
	public readonly setOutputBundle: (
		outputBundle: OutputBundleWithPlaceholders,
		outputOptions: NormalizedOutputOptions,
		facadeChunkByModule: Map<Module, Chunk>
	) => void;

	private readonly fileEmitter: FileEmitter;
	private readonly pluginCache: Record<string, SerializablePluginCache> | undefined;
	private readonly pluginContexts = new Map<Plugin, PluginContext>();
	private readonly plugins: Plugin[];

	constructor(
		private readonly graph: Graph,
		private readonly options: NormalizedInputOptions,
		userPlugins: readonly Plugin[],
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
		this.emitFile = this.fileEmitter.emitFile.bind(this.fileEmitter);
		this.getFileName = this.fileEmitter.getFileName.bind(this.fileEmitter);
		this.finaliseAssets = this.fileEmitter.assertAssetsFinalized.bind(this.fileEmitter);
		this.setOutputBundle = this.fileEmitter.setOutputBundle.bind(this.fileEmitter);
		this.plugins = userPlugins.concat(basePluginDriver ? basePluginDriver.plugins : []);
		const existingPluginNames = new Set<string>();
		for (const plugin of this.plugins) {
			this.pluginContexts.set(
				plugin,
				getPluginContext(plugin, pluginCache, graph, options, this.fileEmitter, existingPluginNames)
			);
		}
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

	public createOutputPluginDriver(plugins: readonly Plugin[]): PluginDriver {
		return new PluginDriver(this.graph, this.options, plugins, this.pluginCache, this);
	}

	// chains, first non-null result stops and returns
	hookFirst<H extends AsyncPluginHooks & FirstPluginHooks>(
		hookName: H,
		args: Parameters<PluginHooks[H]>,
		replaceContext?: ReplaceContext | null,
		skipped?: Set<Plugin> | null
	): EnsurePromise<ReturnType<PluginHooks[H]>> {
		let promise: EnsurePromise<ReturnType<PluginHooks[H]>> = Promise.resolve(undefined as any);
		for (const plugin of this.plugins) {
			if (skipped && skipped.has(plugin)) continue;
			promise = promise.then(result => {
				if (result != null) return result;
				return this.runHook(hookName, args, plugin, false, replaceContext);
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
		for (const plugin of this.plugins) {
			const result = this.runHookSync(hookName, args, plugin, replaceContext);
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
		for (const plugin of this.plugins) {
			const hookPromise = this.runHook(hookName, args, plugin, false, replaceContext);
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
		for (const plugin of this.plugins) {
			promise = promise.then(arg0 => {
				const args = [arg0, ...rest] as Parameters<PluginHooks[H]>;
				const hookPromise = this.runHook(hookName, args, plugin, false, replaceContext);
				if (!hookPromise) return arg0;
				return hookPromise.then(result =>
					reduce.call(this.pluginContexts.get(plugin), arg0, result, plugin)
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
		for (const plugin of this.plugins) {
			const args = [arg0, ...rest] as Parameters<PluginHooks[H]>;
			const result = this.runHookSync(hookName, args, plugin, replaceContext);
			arg0 = reduce.call(this.pluginContexts.get(plugin), arg0, result, plugin);
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
		for (const plugin of this.plugins) {
			promise = promise.then(value => {
				const hookPromise = this.runHook(hookName, args, plugin, true, replaceContext);
				if (!hookPromise) return value;
				return hookPromise.then(result =>
					reduce.call(this.pluginContexts.get(plugin), value, result, plugin)
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
		for (const plugin of this.plugins) {
			const result = this.runHookSync(hookName, args, plugin, replaceContext);
			acc = reduce.call(this.pluginContexts.get(plugin), acc, result, plugin);
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
		for (const plugin of this.plugins) {
			promise = promise.then(
				() => this.runHook(hookName, args, plugin, false, replaceContext) as Promise<void>
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
		for (const plugin of this.plugins) {
			this.runHookSync(hookName, args, plugin, replaceContext);
		}
	}

	/**
	 * Run an async plugin hook and return the result.
	 * @param hookName Name of the plugin hook. Must be either in `PluginHooks` or `OutputPluginValueHooks`.
	 * @param args Arguments passed to the plugin hook.
	 * @param plugin The actual pluginObject to run.
	 * @param permitValues If true, values can be passed instead of functions for the plugin hook.
	 * @param hookContext When passed, the plugin context can be overridden.
	 */
	private runHook<H extends PluginValueHooks>(
		hookName: H,
		args: Parameters<AddonHookFunction>,
		plugin: Plugin,
		permitValues: true,
		hookContext?: ReplaceContext | null
	): EnsurePromise<ReturnType<AddonHookFunction>>;
	private runHook<H extends AsyncPluginHooks>(
		hookName: H,
		args: Parameters<PluginHooks[H]>,
		plugin: Plugin,
		permitValues: false,
		hookContext?: ReplaceContext | null
	): EnsurePromise<ReturnType<PluginHooks[H]>>;
	private runHook<H extends AsyncPluginHooks>(
		hookName: H,
		args: Parameters<PluginHooks[H]>,
		plugin: Plugin,
		permitValues: boolean,
		hookContext?: ReplaceContext | null
	): EnsurePromise<ReturnType<PluginHooks[H]>> {
		const hook = plugin[hookName];
		if (!hook) return undefined as any;

		let context = this.pluginContexts.get(plugin)!;
		if (hookContext) {
			context = hookContext(context, plugin);
		}

		let action: [string, string, Parameters<any>] | null = null;
		return Promise.resolve()
			.then(() => {
				// permit values allows values to be returned instead of a functional hook
				if (typeof hook !== 'function') {
					if (permitValues) return hook;
					return throwInvalidHookError(hookName, plugin.name);
				}
				// eslint-disable-next-line @typescript-eslint/ban-types
				const hookResult = (hook as Function).apply(context, args);

				if (!hookResult || !hookResult.then) {
					// short circuit for non-thenables and non-Promises
					return hookResult;
				}

				// Track pending hook actions to properly error out when
				// unfulfilled promises cause rollup to abruptly and confusingly
				// exit with a successful 0 return code but without producing any
				// output, errors or warnings.
				action = [plugin.name, hookName, args];
				addUnresolvedAction(action);

				// Although it would be more elegant to just return hookResult here
				// and put the .then() handler just above the .catch() handler below,
				// doing so would subtly change the defacto async event dispatch order
				// which at least one test and some plugins in the wild may depend on.
				const promise = Promise.resolve(hookResult);
				return promise.then(() => {
					// action was fulfilled
					resolveAction(action as [string, string, Parameters<any>]);
					return promise;
				});
			})
			.catch(err => {
				if (action !== null) {
					// action considered to be fulfilled since error being handled
					resolveAction(action);
				}
				return throwPluginError(err, plugin.name, { hook: hookName });
			});
	}

	/**
	 * Run a sync plugin hook and return the result.
	 * @param hookName Name of the plugin hook. Must be in `PluginHooks`.
	 * @param args Arguments passed to the plugin hook.
	 * @param plugin The acutal plugin
	 * @param hookContext When passed, the plugin context can be overridden.
	 */
	private runHookSync<H extends SyncPluginHooks>(
		hookName: H,
		args: Parameters<PluginHooks[H]>,
		plugin: Plugin,
		hookContext?: ReplaceContext
	): ReturnType<PluginHooks[H]> {
		const hook = plugin[hookName];
		if (!hook) return undefined as any;

		let context = this.pluginContexts.get(plugin)!;
		if (hookContext) {
			context = hookContext(context, plugin);
		}

		try {
			// permit values allows values to be returned instead of a functional hook
			if (typeof hook !== 'function') {
				return throwInvalidHookError(hookName, plugin.name);
			}
			// eslint-disable-next-line @typescript-eslint/ban-types
			return (hook as Function).apply(context, args);
		} catch (err: any) {
			return throwPluginError(err, plugin.name, { hook: hookName });
		}
	}
}
