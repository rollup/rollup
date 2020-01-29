import Graph from '../Graph';
import {
	EmitFile,
	OutputBundleWithPlaceholders,
	Plugin,
	PluginContext,
	PluginHooks,
	SerializablePluginCache
} from '../rollup/types';
import { getRollupDefaultPlugin } from './defaultPlugin';
import { errInputHookInOutputPlugin, error } from './error';
import { FileEmitter } from './FileEmitter';
import { getPluginContexts } from './PluginContext';
import { throwPluginError, warnDeprecatedHooks } from './pluginUtils';

type Args<T> = T extends (...args: infer K) => any ? K : never;
type EnsurePromise<T> = Promise<T extends Promise<infer K> ? K : T>;

export type Reduce<R = any, T = any> = (reduction: T, result: R, plugin: Plugin) => T;
export type ReplaceContext = (context: PluginContext, plugin: Plugin) => PluginContext;

export class PluginDriver {
	public emitFile: EmitFile;
	public finaliseAssets: () => void;
	public getFileName: (fileReferenceId: string) => string;
	public setOutputBundle: (
		outputBundle: OutputBundleWithPlaceholders,
		assetFileNames: string
	) => void;

	private fileEmitter: FileEmitter;
	private graph: Graph;
	private pluginCache: Record<string, SerializablePluginCache> | undefined;
	private pluginContexts: PluginContext[];
	private plugins: Plugin[];
	private preserveSymlinks: boolean;
	private previousHooks = new Set<string>(['options']);

	constructor(
		graph: Graph,
		userPlugins: Plugin[],
		pluginCache: Record<string, SerializablePluginCache> | undefined,
		preserveSymlinks: boolean,
		basePluginDriver?: PluginDriver
	) {
		warnDeprecatedHooks(userPlugins, graph);
		this.graph = graph;
		this.pluginCache = pluginCache;
		this.preserveSymlinks = preserveSymlinks;
		this.fileEmitter = new FileEmitter(graph, basePluginDriver && basePluginDriver.fileEmitter);
		this.emitFile = this.fileEmitter.emitFile;
		this.getFileName = this.fileEmitter.getFileName;
		this.finaliseAssets = this.fileEmitter.assertAssetsFinalized;
		this.setOutputBundle = this.fileEmitter.setOutputBundle;
		this.plugins = userPlugins.concat(
			basePluginDriver ? basePluginDriver.plugins : [getRollupDefaultPlugin(preserveSymlinks)]
		);
		this.pluginContexts = this.plugins.map(getPluginContexts(pluginCache, graph, this.fileEmitter));
		if (basePluginDriver) {
			for (const plugin of userPlugins) {
				for (const hook of basePluginDriver.previousHooks) {
					if (hook in plugin) {
						graph.warn(errInputHookInOutputPlugin(plugin.name, hook));
					}
				}
			}
		}
	}

	public createOutputPluginDriver(plugins: Plugin[]): PluginDriver {
		return new PluginDriver(this.graph, plugins, this.pluginCache, this.preserveSymlinks, this);
	}

	// chains, first non-null result stops and returns
	hookFirst<H extends keyof PluginHooks, R = ReturnType<PluginHooks[H]>>(
		hookName: H,
		args: Args<PluginHooks[H]>,
		replaceContext?: ReplaceContext | null,
		skip?: number | null
	): EnsurePromise<R> {
		let promise: Promise<any> = Promise.resolve();
		for (let i = 0; i < this.plugins.length; i++) {
			if (skip === i) continue;
			promise = promise.then((result: any) => {
				if (result != null) return result;
				return this.runHook(hookName, args as any[], i, false, replaceContext);
			});
		}
		return promise;
	}

	// chains synchronously, first non-null result stops and returns
	hookFirstSync<H extends keyof PluginHooks, R = ReturnType<PluginHooks[H]>>(
		hookName: H,
		args: Args<PluginHooks[H]>,
		replaceContext?: ReplaceContext
	): R {
		for (let i = 0; i < this.plugins.length; i++) {
			const result = this.runHookSync(hookName, args, i, replaceContext);
			if (result != null) return result as any;
		}
		return null as any;
	}

	// parallel, ignores returns
	hookParallel<H extends keyof PluginHooks>(
		hookName: H,
		args: Args<PluginHooks[H]>,
		replaceContext?: ReplaceContext
	): Promise<void> {
		const promises: Promise<void>[] = [];
		for (let i = 0; i < this.plugins.length; i++) {
			const hookPromise = this.runHook<void>(hookName, args as any[], i, false, replaceContext);
			if (!hookPromise) continue;
			promises.push(hookPromise);
		}
		return Promise.all(promises).then(() => {});
	}

	// chains, reduces returns of type R, to type T, handling the reduced value as the first hook argument
	hookReduceArg0<H extends keyof PluginHooks, V, R = ReturnType<PluginHooks[H]>>(
		hookName: H,
		[arg0, ...args]: any[],
		reduce: Reduce<V, R>,
		replaceContext?: ReplaceContext
	) {
		let promise = Promise.resolve(arg0);
		for (let i = 0; i < this.plugins.length; i++) {
			promise = promise.then(arg0 => {
				const hookPromise = this.runHook(hookName, [arg0, ...args], i, false, replaceContext);
				if (!hookPromise) return arg0;
				return hookPromise.then((result: any) =>
					reduce.call(this.pluginContexts[i], arg0, result, this.plugins[i])
				);
			});
		}
		return promise;
	}

	// chains synchronously, reduces returns of type R, to type T, handling the reduced value as the first hook argument
	hookReduceArg0Sync<H extends keyof PluginHooks, V, R = ReturnType<PluginHooks[H]>>(
		hookName: H,
		[arg0, ...args]: any[],
		reduce: Reduce<V, R>,
		replaceContext?: ReplaceContext
	): R {
		for (let i = 0; i < this.plugins.length; i++) {
			const result: any = this.runHookSync(hookName, [arg0, ...args], i, replaceContext);
			arg0 = reduce.call(this.pluginContexts[i], arg0, result, this.plugins[i]);
		}
		return arg0;
	}

	// chains, reduces returns of type R, to type T, handling the reduced value separately. permits hooks as values.
	hookReduceValue<H extends keyof Plugin, R = any, T = any>(
		hookName: H,
		initialValue: T | Promise<T>,
		args: any[],
		reduce: Reduce<R, T>,
		replaceContext?: ReplaceContext
	): Promise<T> {
		let promise = Promise.resolve(initialValue);
		for (let i = 0; i < this.plugins.length; i++) {
			promise = promise.then(value => {
				const hookPromise = this.runHook(hookName, args, i, true, replaceContext);
				if (!hookPromise) return value;
				return hookPromise.then((result: any) =>
					reduce.call(this.pluginContexts[i], value, result, this.plugins[i])
				);
			});
		}
		return promise;
	}

	// chains, reduces returns of type R, to type T, handling the reduced value separately. permits hooks as values.
	hookReduceValueSync<H extends keyof PluginHooks, R = any, T = any>(
		hookName: H,
		initialValue: T,
		args: any[],
		reduce: Reduce<R, T>,
		replaceContext?: ReplaceContext
	): T {
		let acc = initialValue;
		for (let i = 0; i < this.plugins.length; i++) {
			const result: any = this.runHookSync(hookName, args, i, replaceContext);
			acc = reduce.call(this.pluginContexts[i], acc, result, this.plugins[i]);
		}
		return acc;
	}

	// chains, ignores returns
	async hookSeq<H extends keyof PluginHooks>(
		hookName: H,
		args: Args<PluginHooks[H]>,
		replaceContext?: ReplaceContext
	): Promise<void> {
		let promise: Promise<void> = Promise.resolve();
		for (let i = 0; i < this.plugins.length; i++)
			promise = promise.then(() =>
				this.runHook<void>(hookName, args as any[], i, false, replaceContext)
			);
		return promise;
	}

	// chains, ignores returns
	hookSeqSync<H extends keyof PluginHooks>(
		hookName: H,
		args: Args<PluginHooks[H]>,
		replaceContext?: ReplaceContext
	): void {
		for (let i = 0; i < this.plugins.length; i++)
			this.runHookSync<void>(hookName, args as any[], i, replaceContext);
	}

	private runHook<T>(
		hookName: string,
		args: any[],
		pluginIndex: number,
		permitValues: boolean,
		hookContext?: ReplaceContext | null
	): Promise<T> {
		this.previousHooks.add(hookName);
		const plugin = this.plugins[pluginIndex];
		const hook = (plugin as any)[hookName];
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
					return error({
						code: 'INVALID_PLUGIN_HOOK',
						message: `Error running plugin hook ${hookName} for ${plugin.name}, expected a function hook.`
					});
				}
				return hook.apply(context, args);
			})
			.catch(err => throwPluginError(err, plugin.name, { hook: hookName }));
	}

	private runHookSync<T>(
		hookName: string,
		args: any[],
		pluginIndex: number,
		hookContext?: ReplaceContext
	): T {
		this.previousHooks.add(hookName);
		const plugin = this.plugins[pluginIndex];
		let context = this.pluginContexts[pluginIndex];
		const hook = (plugin as any)[hookName];
		if (!hook) return undefined as any;

		if (hookContext) {
			context = hookContext(context, plugin);
		}
		try {
			// permit values allows values to be returned instead of a functional hook
			if (typeof hook !== 'function') {
				return error({
					code: 'INVALID_PLUGIN_HOOK',
					message: `Error running plugin hook ${hookName} for ${plugin.name}, expected a function hook.`
				});
			}
			return hook.apply(context, args);
		} catch (err) {
			return throwPluginError(err, plugin.name, { hook: hookName });
		}
	}
}
