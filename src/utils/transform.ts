import MagicString, { SourceMap } from 'magic-string';
import Graph from '../Graph';
import Module from '../Module';
import {
	DecodedSourceMapOrMissing,
	EmittedFile,
	Plugin,
	PluginCache,
	PluginContext,
	RollupError,
	RollupWarning,
	TransformModuleJSON,
	TransformResult,
	TransformSourceDescription
} from '../rollup/types';
import { collapseSourcemap } from './collapseSourcemaps';
import { decodedSourcemap } from './decodedSourcemap';
import { augmentCodeLocation } from './error';
import { dirname, resolve } from './path';
import { throwPluginError, trackPluginCache } from './pluginDriver';

export default function transform(
	graph: Graph,
	source: TransformSourceDescription,
	module: Module
): Promise<TransformModuleJSON> {
	const id = module.id;
	const sourcemapChain: DecodedSourceMapOrMissing[] = [];

	let originalSourcemap = source.map === null ? null : decodedSourcemap(source.map);
	const originalCode = source.code;
	let ast = source.ast;
	const transformDependencies: string[] = [];
	const emittedFiles: EmittedFile[] = [];
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
					graph.watchFiles[resolve(dirname(id), dep)] = true;
				}
			}
		} else {
			// files emitted by a transform hook need to be emitted again if the hook is skipped
			if (emittedFiles.length) module.transformFiles = emittedFiles;
			if (result && typeof result === 'object' && Array.isArray(result.dependencies)) {
				// not great, but a useful way to track this without assuming WeakMap
				if (!(curPlugin as any).warnedTransformDependencies)
					graph.warnDeprecation(
						`Returning "dependencies" from the "transform" hook as done by plugin ${plugin.name} is deprecated. The "this.addWatchFile" plugin context function should be used instead.`,
						true
					);
				(curPlugin as any).warnedTransformDependencies = true;
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

		// strict null check allows 'null' maps to not be pushed to the chain, while 'undefined' gets the missing map warning
		if (result.map !== null) {
			const map = decodedSourcemap(result.map);
			sourcemapChain.push(map || { missing: true, plugin: plugin.name });
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
				if (curPlugin.cacheKey) customTransformCache = true;
				else trackedPluginCache = trackPluginCache(pluginContext.cache);
				return {
					...pluginContext,
					cache: trackedPluginCache ? trackedPluginCache.cache : pluginContext.cache,
					warn(warning: RollupWarning | string, pos?: number | { column: number; line: number }) {
						if (typeof warning === 'string') warning = { message: warning } as RollupWarning;
						if (pos) augmentCodeLocation(warning, pos, curSource, id);
						warning.id = id;
						warning.hook = 'transform';
						pluginContext.warn(warning);
					},
					error(err: RollupError | string, pos?: number | { column: number; line: number }): never {
						if (typeof err === 'string') err = { message: err };
						if (pos) augmentCodeLocation(err, pos, curSource, id);
						err.id = id;
						err.hook = 'transform';
						return pluginContext.error(err);
					},
					emitAsset(name: string, source?: string | Buffer) {
						const emittedFile = { type: 'asset' as 'asset', name, source };
						emittedFiles.push({ ...emittedFile });
						return graph.pluginDriver.emitFile(emittedFile);
					},
					emitChunk(id, options) {
						const emittedFile = { type: 'chunk' as 'chunk', id, name: options && options.name };
						emittedFiles.push({ ...emittedFile });
						return graph.pluginDriver.emitFile(emittedFile);
					},
					emitFile(emittedFile: EmittedFile) {
						emittedFiles.push(emittedFile);
						return graph.pluginDriver.emitFile(emittedFile);
					},
					addWatchFile(id: string) {
						transformDependencies.push(id);
						pluginContext.addWatchFile(id);
					},
					setAssetSource(assetReferenceId, source) {
						pluginContext.setAssetSource(assetReferenceId, source);
						if (!customTransformCache && !setAssetSourceErr) {
							try {
								this.error({
									code: 'INVALID_SETASSETSOURCE',
									message: `setAssetSource cannot be called in transform for caching reasons. Use emitFile with a source, or call setAssetSource in another hook.`
								});
							} catch (err) {
								setAssetSourceErr = err;
							}
						}
					},
					getCombinedSourcemap() {
						const combinedMap = collapseSourcemap(
							graph,
							id,
							originalCode,
							originalSourcemap,
							sourcemapChain
						);
						if (!combinedMap) {
							const magicString = new MagicString(originalCode);
							return magicString.generateMap({ includeContent: true, hires: true, source: id });
						}
						if (originalSourcemap !== combinedMap) {
							originalSourcemap = combinedMap;
							sourcemapChain.length = 0;
						}
						return new SourceMap({
							...combinedMap,
							file: null as any,
							sourcesContent: combinedMap.sourcesContent as string[]
						});
					}
				};
			}
		)
		.catch(err => throwPluginError(err, curPlugin.name, { hook: 'transform', id }))
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
