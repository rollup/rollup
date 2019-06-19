import { decode } from 'sourcemap-codec';
import Graph from '../Graph';
import Module from '../Module';
import {
	Asset,
	EmitAsset,
	EmittedChunk,
	ExistingRawSourceMap,
	Plugin,
	PluginCache,
	PluginContext,
	RawSourceMap,
	RollupError,
	RollupWarning,
	TransformModuleJSON,
	TransformResult,
	TransformSourceDescription
} from '../rollup/types';
import { createTransformEmitAsset } from './assetHooks';
import { augmentCodeLocation, error } from './error';
import { dirname, resolve } from './path';
import { trackPluginCache } from './pluginDriver';

export default function transform(
	graph: Graph,
	source: TransformSourceDescription,
	module: Module
): Promise<TransformModuleJSON> {
	const id = module.id;
	const sourcemapChain: (RawSourceMap | { missing: true; plugin: string })[] = [];

	const originalSourcemap = typeof source.map === 'string' ? JSON.parse(source.map) : source.map;
	if (originalSourcemap && typeof originalSourcemap.mappings === 'string')
		originalSourcemap.mappings = decode(originalSourcemap.mappings);

	const baseEmitAsset = graph.pluginDriver.emitAsset;
	const originalCode = source.code;
	let ast = source.ast;
	let transformDependencies: string[];
	let emittedAssets: Asset[];
	const emittedChunks: EmittedChunk[] = [];
	let customTransformCache = false;
	let moduleSideEffects: boolean | null = null;
	let trackedPluginCache: { cache: PluginCache; used: boolean };
	let curPlugin: Plugin;
	const curSource: string = source.code;

	function transformReducer(
		this: PluginContext,
		code: string,
		result: TransformResult,
		plugin: Plugin
	) {
		// track which plugins use the custom this.cache to opt-out of transform caching
		if (!customTransformCache && trackedPluginCache.used) customTransformCache = true;
		if (customTransformCache) {
			if (result && typeof result === 'object' && Array.isArray(result.dependencies)) {
				for (const dep of result.dependencies) {
					const depId = resolve(dirname(id), dep);
					if (!graph.watchFiles[depId]) graph.watchFiles[depId] = true;
				}
			}
		} else {
			// assets/chunks emitted by a transform hook need to be emitted again if the hook is skipped
			if (emittedAssets.length) module.transformAssets = emittedAssets;
			if (emittedChunks.length) module.transformChunks = emittedChunks;

			if (result && typeof result === 'object' && Array.isArray(result.dependencies)) {
				// not great, but a useful way to track this without assuming WeakMap
				if (!(curPlugin as any).warnedTransformDependencies)
					graph.warnDeprecation(
						`Returning "dependencies" from the "transform" hook as done by plugin ${plugin.name} is deprecated. The "this.addWatchFile" plugin context function should be used instead.`,
						true
					);
				(curPlugin as any).warnedTransformDependencies = true;
				if (!transformDependencies) transformDependencies = [];
				for (const dep of result.dependencies)
					transformDependencies.push(resolve(dirname(id), dep));
			}
		}

		if (typeof result === 'string') {
			result = {
				ast: undefined,
				code: result,
				map: undefined
			};
		} else if (result && typeof result === 'object') {
			if (typeof result.map === 'string') {
				result.map = JSON.parse(result.map);
			}
			if (typeof result.moduleSideEffects === 'boolean') {
				moduleSideEffects = result.moduleSideEffects;
			}
		} else {
			return code;
		}

		if (result.map && typeof (result.map as ExistingRawSourceMap).mappings === 'string') {
			(result.map as ExistingRawSourceMap).mappings = decode(
				(result.map as ExistingRawSourceMap).mappings
			);
		}

		// strict null check allows 'null' maps to not be pushed to the chain, while 'undefined' gets the missing map warning
		if (result.map !== null) {
			sourcemapChain.push(
				(result.map as ExistingRawSourceMap) || { missing: true, plugin: plugin.name }
			);
		}

		ast = result.ast;

		return result.code;
	}

	let setAssetSourceErr: any;

	return graph.pluginDriver
		.hookReduceArg0<any, string>(
			'transform',
			[curSource, id],
			transformReducer,
			(pluginContext, plugin) => {
				curPlugin = plugin as Plugin;
				if (curPlugin.cacheKey) customTransformCache = true;
				else trackedPluginCache = trackPluginCache(pluginContext.cache);

				let emitAsset: EmitAsset;
				({ assets: emittedAssets, emitAsset } = createTransformEmitAsset(
					graph.assetsById,
					baseEmitAsset
				));
				return {
					...pluginContext,
					cache: trackedPluginCache ? trackedPluginCache.cache : pluginContext.cache,
					warn(warning: RollupWarning | string, pos?: { column: number; line: number }) {
						if (typeof warning === 'string') warning = { message: warning } as RollupWarning;
						if (pos) augmentCodeLocation(warning, pos, curSource, id);
						warning.id = id;
						warning.hook = 'transform';
						pluginContext.warn(warning);
					},
					error(err: RollupError | string, pos?: { column: number; line: number }): never {
						if (typeof err === 'string') err = { message: err };
						if (pos) augmentCodeLocation(err, pos, curSource, id);
						err.id = id;
						err.hook = 'transform';
						return pluginContext.error(err);
					},
					emitAsset,
					emitChunk(id, options) {
						emittedChunks.push({ id, options });
						return graph.pluginDriver.emitChunk(id, options);
					},
					addWatchFile(id: string) {
						if (!transformDependencies) transformDependencies = [];
						transformDependencies.push(id);
						pluginContext.addWatchFile(id);
					},
					setAssetSource(assetReferenceId, source) {
						pluginContext.setAssetSource(assetReferenceId, source);
						if (!customTransformCache && !setAssetSourceErr) {
							try {
								this.error({
									code: 'INVALID_SETASSETSOURCE',
									message: `setAssetSource cannot be called in transform for caching reasons. Use emitAsset with a source, or call setAssetSource in another hook.`
								});
							} catch (err) {
								setAssetSourceErr = err;
							}
						}
					}
				};
			}
		)
		.catch(err => {
			if (typeof err === 'string') err = { message: err };
			if (err.code !== 'PLUGIN_ERROR') {
				if (err.code) err.pluginCode = err.code;
				err.code = 'PLUGIN_ERROR';
			}
			err.id = id;
			error(err);
		})
		.then(code => {
			if (!customTransformCache && setAssetSourceErr) throw setAssetSourceErr;

			return {
				ast: ast as any,
				code,
				customTransformCache,
				moduleSideEffects,
				originalCode,
				originalSourcemap,
				sourcemapChain,
				transformDependencies
			};
		});
}
