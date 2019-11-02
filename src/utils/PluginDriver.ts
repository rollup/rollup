import Graph from '../Graph';
import {
	EmitFile,
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
import { throwPluginError, warnDeprecatedHooks } from './pluginUtils';

type Args<T> = T extends (...args: infer K) => any ? K : never;
type EnsurePromise<T> = Promise<T extends Promise<infer K> ? K : T>;

export type Reduce<R = any, T = any> = (reduction: T, result: R, plugin: Plugin) => T;
export type ReplaceContext = (context: PluginContext, plugin: Plugin) => PluginContext;

export class PluginDriver {
	public emitFile: EmitFile;
	public finaliseAssets: () => void;
	public getFileName: (fileReferenceId: string) => string;
	public startOutput: (outputBundle: OutputBundleWithPlaceholders, assetFileNames: string) => void;

	private fileEmitter: FileEmitter;
	private pluginContexts: PluginContext[];
	private plugins: Plugin[];

	constructor(
		graph: Graph,
		userPlugins: Plugin[],
		pluginCache: Record<string, SerializablePluginCache> | void,
		preserveSymlinks: boolean,
		watcher?: RollupWatcher
	) {
		warnDeprecatedHooks(userPlugins, graph);
		this.fileEmitter = new FileEmitter(graph);
		this.emitFile = this.fileEmitter.emitFile.bind(this.fileEmitter);
		this.getFileName = this.fileEmitter.getFileName.bind(this.fileEmitter);
		this.finaliseAssets = this.fileEmitter.assertAssetsFinalized.bind(this.fileEmitter);
		this.startOutput = this.fileEmitter.startOutput.bind(this.fileEmitter);
		this.plugins = userPlugins.concat([getRollupDefaultPlugin(preserveSymlinks)]);
		this.pluginContexts = this.plugins.map(
			getPluginContexts(pluginCache, graph, this.fileEmitter, watcher)
		);
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
			const result = this.runHookSync(hookName, args, i, false, replaceContext);
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
			const result: any = this.runHookSync(hookName, [arg0, ...args], i, false, replaceContext);
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
			const result: any = this.runHookSync(hookName, args, i, true, replaceContext);
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
		let promise: Promise<void> = Promise.resolve() as any;
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
			this.runHookSync<void>(hookName, args as any[], i, false, replaceContext);
	}

	private runHook<T>(
		hookName: string,
		args: any[],
		pluginIndex: number,
		permitValues = false,
		hookContext?: ReplaceContext | null
	): Promise<T> {
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
					error({
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
		permitValues = false,
		hookContext?: ReplaceContext
	): T {
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
}
