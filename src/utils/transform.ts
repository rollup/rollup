import { decode } from 'sourcemap-codec';
import Graph from '../Graph';
import Module from '../Module';
import {
	Asset,
	EmitAsset,
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
	let assets: Asset[];
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
			// assets emitted by transform are transformDependencies
			if (assets.length) module.transformAssets = assets;

			if (result && typeof result === 'object' && Array.isArray(result.dependencies)) {
				// not great, but a useful way to track this without assuming WeakMap
				if (!(<any>curPlugin).warnedTransformDependencies)
					this.warn({
						code: 'TRANSFORM_DEPENDENCIES_DEPRECATED',
						message: `Returning "dependencies" from plugin transform hook is deprecated for using this.addWatchFile() instead.`
					});
				(<any>curPlugin).warnedTransformDependencies = true;
				if (!transformDependencies) transformDependencies = [];
				for (const dep of result.dependencies)
					transformDependencies.push(resolve(dirname(id), dep));
			}
		}

		if (!result) return code;

		if (typeof result === 'string') {
			result = {
				ast: undefined,
				code: result,
				map: undefined
			};
		} else {
			if (typeof result.map === 'string') {
				result.map = JSON.parse(result.map);
			}
			if (typeof result.moduleSideEffects === 'boolean') {
				moduleSideEffects = result.moduleSideEffects;
			}
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
				curPlugin = plugin;
				if (plugin.cacheKey) customTransformCache = true;
				else trackedPluginCache = trackPluginCache(pluginContext.cache);

				let emitAsset: EmitAsset;
				({ assets, emitAsset } = createTransformEmitAsset(graph.assetsById, baseEmitAsset));
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
					error(err: RollupError | string, pos?: { column: number; line: number }) {
						if (typeof err === 'string') err = { message: err };
						if (pos) augmentCodeLocation(err, pos, curSource, id);
						err.id = id;
						err.hook = 'transform';
						pluginContext.error(err);
					},
					emitAsset,
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
				ast,
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
