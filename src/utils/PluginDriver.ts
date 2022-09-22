import type Chunk from '../Chunk';
import type Graph from '../Graph';
import type Module from '../Module';
import type {
	AddonHookFunction,
	AddonHooks,
	AsyncPluginHooks,
	EmitFile,
	FirstPluginHooks,
	FunctionPluginHooks,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	ParallelPluginHooks,
	Plugin,
	PluginContext,
	SequentialPluginHooks,
	SerializablePluginCache,
	SyncPluginHooks
} from '../rollup/types';
import { InputPluginHooks } from '../rollup/types';
import { FileEmitter } from './FileEmitter';
import { getPluginContext } from './PluginContext';
import {
	errInputHookInOutputPlugin,
	errInvalidAddonPluginHook,
	errInvalidFunctionPluginHook,
	error
} from './error';
import { getOrCreate } from './getOrCreate';
import { OutputBundleWithPlaceholders } from './outputBundle';
import { throwPluginError, warnDeprecatedHooks } from './pluginUtils';

/**
 * Coerce a promise union to always be a promise.
 * @example EnsurePromise<string | Promise<string>> -> Promise<string>
 */
type EnsurePromise<T> = Promise<Awaited<T>>;
/**
 * Get the type of the first argument in a function.
 * @example Arg0<(a: string, b: number) => void> -> string
 */
type Arg0<H extends keyof FunctionPluginHooks> = Parameters<FunctionPluginHooks[H]>[0];

// This will make sure no input hook is omitted
const inputHookNames: {
	[P in InputPluginHooks]: 1;
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

export type HookAction = [plugin: string, hook: string, args: unknown[]];

export class PluginDriver {
	public readonly emitFile: EmitFile;
	public finaliseAssets: () => void;
	public getFileName: (fileReferenceId: string) => string;
	public readonly setOutputBundle: (
		outputBundle: OutputBundleWithPlaceholders,
		outputOptions: NormalizedOutputOptions,
		facadeChunkByModule: ReadonlyMap<Module, Chunk>
	) => void;

	private readonly fileEmitter: FileEmitter;
	private readonly pluginContexts: ReadonlyMap<Plugin, PluginContext>;
	private readonly plugins: readonly Plugin[];
	private readonly sortedPlugins = new Map<AsyncPluginHooks, Plugin[]>();
	private readonly unfulfilledActions = new Set<HookAction>();

	constructor(
		private readonly graph: Graph,
		private readonly options: NormalizedInputOptions,
		userPlugins: readonly Plugin[],
		private readonly pluginCache: Record<string, SerializablePluginCache> | undefined,
		basePluginDriver?: PluginDriver
	) {
		warnDeprecatedHooks(userPlugins, options);
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

		this.pluginContexts = new Map(
			this.plugins.map(plugin => [
				plugin,
				getPluginContext(plugin, pluginCache, graph, options, this.fileEmitter, existingPluginNames)
			])
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

	public createOutputPluginDriver(plugins: readonly Plugin[]): PluginDriver {
		return new PluginDriver(this.graph, this.options, plugins, this.pluginCache, this);
	}

	getUnfulfilledHookActions(): Set<HookAction> {
		return this.unfulfilledActions;
	}

	// chains, first non-null result stops and returns
	hookFirst<H extends AsyncPluginHooks & FirstPluginHooks>(
		hookName: H,
		args: Parameters<FunctionPluginHooks[H]>,
		replaceContext?: ReplaceContext | null,
		skipped?: ReadonlySet<Plugin> | null
	): Promise<ReturnType<FunctionPluginHooks[H]> | null> {
		let promise: Promise<ReturnType<FunctionPluginHooks[H]> | null> = Promise.resolve(null);
		for (const plugin of this.getSortedPlugins(hookName)) {
			if (skipped && skipped.has(plugin)) continue;
			promise = promise.then(result => {
				if (result != null) return result;
				return this.runHook(hookName, args, plugin, replaceContext);
			});
		}
		return promise;
	}

	// chains synchronously, first non-null result stops and returns
	hookFirstSync<H extends SyncPluginHooks & FirstPluginHooks>(
		hookName: H,
		args: Parameters<FunctionPluginHooks[H]>,
		replaceContext?: ReplaceContext
	): ReturnType<FunctionPluginHooks[H]> | null {
		for (const plugin of this.getSortedPlugins(hookName)) {
			const result = this.runHookSync(hookName, args, plugin, replaceContext);
			if (result != null) return result;
		}
		return null;
	}

	// parallel, ignores returns
	async hookParallel<H extends AsyncPluginHooks & ParallelPluginHooks>(
		hookName: H,
		args: Parameters<FunctionPluginHooks[H]>,
		replaceContext?: ReplaceContext
	): Promise<void> {
		const parallelPromises: Promise<unknown>[] = [];
		for (const plugin of this.getSortedPlugins(hookName)) {
			if ((plugin[hookName] as { sequential?: boolean }).sequential) {
				await Promise.all(parallelPromises);
				parallelPromises.length = 0;
				await this.runHook(hookName, args, plugin, replaceContext);
			} else {
				parallelPromises.push(this.runHook(hookName, args, plugin, replaceContext));
			}
		}
		await Promise.all(parallelPromises);
	}

	// chains, reduces returned value, handling the reduced value as the first hook argument
	hookReduceArg0<H extends AsyncPluginHooks & SequentialPluginHooks>(
		hookName: H,
		[arg0, ...rest]: Parameters<FunctionPluginHooks[H]>,
		reduce: (
			reduction: Arg0<H>,
			result: ReturnType<FunctionPluginHooks[H]>,
			plugin: Plugin
		) => Arg0<H>,
		replaceContext?: ReplaceContext
	): Promise<Arg0<H>> {
		let promise = Promise.resolve(arg0);
		for (const plugin of this.getSortedPlugins(hookName)) {
			promise = promise.then(arg0 =>
				this.runHook(
					hookName,
					[arg0, ...rest] as Parameters<FunctionPluginHooks[H]>,
					plugin,
					replaceContext
				).then(result => reduce.call(this.pluginContexts.get(plugin), arg0, result, plugin))
			);
		}
		return promise;
	}

	// chains synchronously, reduces returned value, handling the reduced value as the first hook argument
	hookReduceArg0Sync<H extends SyncPluginHooks & SequentialPluginHooks>(
		hookName: H,
		[arg0, ...rest]: Parameters<FunctionPluginHooks[H]>,
		reduce: (
			reduction: Arg0<H>,
			result: ReturnType<FunctionPluginHooks[H]>,
			plugin: Plugin
		) => Arg0<H>,
		replaceContext?: ReplaceContext
	): Arg0<H> {
		for (const plugin of this.getSortedPlugins(hookName)) {
			const args = [arg0, ...rest] as Parameters<FunctionPluginHooks[H]>;
			const result = this.runHookSync(hookName, args, plugin, replaceContext);
			arg0 = reduce.call(this.pluginContexts.get(plugin), arg0, result, plugin);
		}
		return arg0;
	}

	// chains, reduces returned value to type string, handling the reduced value separately. permits hooks as values.
	async hookReduceValue<H extends AddonHooks>(
		hookName: H,
		initialValue: string | Promise<string>,
		args: Parameters<AddonHookFunction>,
		reducer: (result: string, next: string) => string
	): Promise<string> {
		const results: string[] = [];
		const parallelResults: (string | Promise<string>)[] = [];
		for (const plugin of this.getSortedPlugins(hookName, validateAddonPluginHandler)) {
			if ((plugin[hookName] as { sequential?: boolean }).sequential) {
				results.push(...(await Promise.all(parallelResults)));
				parallelResults.length = 0;
				results.push(await this.runHook(hookName, args, plugin));
			} else {
				parallelResults.push(this.runHook(hookName, args, plugin));
			}
		}
		results.push(...(await Promise.all(parallelResults)));
		return results.reduce(reducer, await initialValue);
	}

	// chains synchronously, reduces returned value to type T, handling the reduced value separately. permits hooks as values.
	hookReduceValueSync<H extends SyncPluginHooks & SequentialPluginHooks, T>(
		hookName: H,
		initialValue: T,
		args: Parameters<FunctionPluginHooks[H]>,
		reduce: (reduction: T, result: ReturnType<FunctionPluginHooks[H]>, plugin: Plugin) => T,
		replaceContext?: ReplaceContext
	): T {
		let acc = initialValue;
		for (const plugin of this.getSortedPlugins(hookName)) {
			const result = this.runHookSync(hookName, args, plugin, replaceContext);
			acc = reduce.call(this.pluginContexts.get(plugin), acc, result, plugin);
		}
		return acc;
	}

	// chains, ignores returns
	hookSeq<H extends AsyncPluginHooks & SequentialPluginHooks>(
		hookName: H,
		args: Parameters<FunctionPluginHooks[H]>,
		replaceContext?: ReplaceContext
	): Promise<void> {
		let promise: Promise<unknown> = Promise.resolve();
		for (const plugin of this.getSortedPlugins(hookName)) {
			promise = promise.then(() => this.runHook(hookName, args, plugin, replaceContext));
		}
		return promise.then(noReturn);
	}

	private getSortedPlugins(
		hookName: keyof FunctionPluginHooks | AddonHooks,
		validateHandler?: (handler: unknown, hookName: string, plugin: Plugin) => void
	): Plugin[] {
		return getOrCreate(this.sortedPlugins, hookName, () =>
			getSortedValidatedPlugins(hookName, this.plugins, validateHandler)
		);
	}

	/**
	 * Run an async plugin hook and return the result.
	 * @param hookName Name of the plugin hook. Must be either in `PluginHooks` or `OutputPluginValueHooks`.
	 * @param args Arguments passed to the plugin hook.
	 * @param plugin The actual pluginObject to run.
	 * @param replaceContext When passed, the plugin context can be overridden.
	 */
	private runHook<H extends AddonHooks>(
		hookName: H,
		args: Parameters<AddonHookFunction>,
		plugin: Plugin
	): EnsurePromise<ReturnType<AddonHookFunction>>;
	private runHook<H extends AsyncPluginHooks>(
		hookName: H,
		args: Parameters<FunctionPluginHooks[H]>,
		plugin: Plugin,
		replaceContext?: ReplaceContext | null
	): Promise<ReturnType<FunctionPluginHooks[H]>>;
	// Implementation signature
	private runHook<H extends AsyncPluginHooks | AddonHooks>(
		hookName: H,
		args: unknown[],
		plugin: Plugin,
		replaceContext?: ReplaceContext | null
	): Promise<unknown> {
		// We always filter for plugins that support the hook before running it
		const hook = plugin[hookName]!;
		const handler = typeof hook === 'object' ? hook.handler : hook;

		let context = this.pluginContexts.get(plugin)!;
		if (replaceContext) {
			context = replaceContext(context, plugin);
		}

		let action: [string, string, Parameters<any>] | null = null;
		return Promise.resolve()
			.then(() => {
				if (typeof handler !== 'function') {
					return handler;
				}
				// eslint-disable-next-line @typescript-eslint/ban-types
				const hookResult = (handler as Function).apply(context, args);

				if (!hookResult?.then) {
					// short circuit for non-thenables and non-Promises
					return hookResult;
				}

				// Track pending hook actions to properly error out when
				// unfulfilled promises cause rollup to abruptly and confusingly
				// exit with a successful 0 return code but without producing any
				// output, errors or warnings.
				action = [plugin.name, hookName, args];
				this.unfulfilledActions.add(action);

				// Although it would be more elegant to just return hookResult here
				// and put the .then() handler just above the .catch() handler below,
				// doing so would subtly change the defacto async event dispatch order
				// which at least one test and some plugins in the wild may depend on.
				return Promise.resolve(hookResult).then(result => {
					// action was fulfilled
					this.unfulfilledActions.delete(action!);
					return result;
				});
			})
			.catch(err => {
				if (action !== null) {
					// action considered to be fulfilled since error being handled
					this.unfulfilledActions.delete(action);
				}
				return throwPluginError(err, plugin.name, { hook: hookName });
			});
	}

	/**
	 * Run a sync plugin hook and return the result.
	 * @param hookName Name of the plugin hook. Must be in `PluginHooks`.
	 * @param args Arguments passed to the plugin hook.
	 * @param plugin The acutal plugin
	 * @param replaceContext When passed, the plugin context can be overridden.
	 */
	private runHookSync<H extends SyncPluginHooks>(
		hookName: H,
		args: Parameters<FunctionPluginHooks[H]>,
		plugin: Plugin,
		replaceContext?: ReplaceContext
	): ReturnType<FunctionPluginHooks[H]> {
		const hook = plugin[hookName]!;
		const handler = typeof hook === 'object' ? hook.handler : hook;

		let context = this.pluginContexts.get(plugin)!;
		if (replaceContext) {
			context = replaceContext(context, plugin);
		}

		try {
			// eslint-disable-next-line @typescript-eslint/ban-types
			return (handler as Function).apply(context, args);
		} catch (err: any) {
			return throwPluginError(err, plugin.name, { hook: hookName });
		}
	}
}

export function getSortedValidatedPlugins(
	hookName: keyof FunctionPluginHooks | AddonHooks,
	plugins: readonly Plugin[],
	validateHandler = validateFunctionPluginHandler
): Plugin[] {
	const pre: Plugin[] = [];
	const normal: Plugin[] = [];
	const post: Plugin[] = [];
	for (const plugin of plugins) {
		const hook = plugin[hookName];
		if (hook) {
			if (typeof hook === 'object') {
				validateHandler(hook.handler, hookName, plugin);
				if (hook.order === 'pre') {
					pre.push(plugin);
					continue;
				}
				if (hook.order === 'post') {
					post.push(plugin);
					continue;
				}
			} else {
				validateHandler(hook, hookName, plugin);
			}
			normal.push(plugin);
		}
	}
	return [...pre, ...normal, ...post];
}

function validateFunctionPluginHandler(handler: unknown, hookName: string, plugin: Plugin) {
	if (typeof handler !== 'function') {
		error(errInvalidFunctionPluginHook(hookName, plugin.name));
	}
}

function validateAddonPluginHandler(handler: unknown, hookName: string, plugin: Plugin) {
	if (typeof handler !== 'string' && typeof handler !== 'function') {
		return error(errInvalidAddonPluginHook(hookName, plugin.name));
	}
}

function noReturn() {}
