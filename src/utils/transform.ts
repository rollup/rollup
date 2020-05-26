import MagicString, { SourceMap } from 'magic-string';
import Module from '../Module';
import {
	DecodedSourceMapOrMissing,
	EmittedFile,
	Plugin,
	PluginContext,
	RollupError,
	RollupWarning,
	SourceDescription,
	TransformModuleJSON,
	TransformPluginContext,
	TransformResult,
	WarningHandler
} from '../rollup/types';
import { collapseSourcemap } from './collapseSourcemaps';
import { decodedSourcemap } from './decodedSourcemap';
import { augmentCodeLocation } from './error';
import { getTrackedPluginCache } from './PluginCache';
import { PluginDriver } from './PluginDriver';
import { throwPluginError } from './pluginUtils';

export default function transform(
	source: SourceDescription,
	module: Module,
	pluginDriver: PluginDriver,
	warn: WarningHandler
): Promise<TransformModuleJSON> {
	const id = module.id;
	const sourcemapChain: DecodedSourceMapOrMissing[] = [];

	let originalSourcemap = source.map === null ? null : decodedSourcemap(source.map);
	const originalCode = source.code;
	let ast = source.ast;
	const transformDependencies: string[] = [];
	const emittedFiles: EmittedFile[] = [];
	let customTransformCache = false;
	const useCustomTransformCache = () => (customTransformCache = true);
	let moduleSideEffects: boolean | null = null;
	let syntheticNamedExports: boolean | null = null;
	let curPlugin: Plugin;
	const curSource: string = source.code;

	function transformReducer(
		this: PluginContext,
		code: string,
		result: TransformResult,
		plugin: Plugin
	) {
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
			if (typeof result.syntheticNamedExports === 'boolean') {
				syntheticNamedExports = result.syntheticNamedExports;
			}
		} else {
			return code;
		}

		// strict null check allows 'null' maps to not be pushed to the chain,
		// while 'undefined' gets the missing map warning
		if (result.map !== null) {
			const map = decodedSourcemap(result.map);
			sourcemapChain.push(map || { missing: true, plugin: plugin.name });
		}

		ast = result.ast;

		return result.code;
	}

	return pluginDriver
		.hookReduceArg0(
			'transform',
			[curSource, id],
			transformReducer,
			(pluginContext, plugin): TransformPluginContext => {
				curPlugin = plugin;
				return {
					...pluginContext,
					cache: customTransformCache
						? pluginContext.cache
						: getTrackedPluginCache(pluginContext.cache, useCustomTransformCache),
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
					emitAsset(name: string, source?: string | Uint8Array) {
						const emittedFile = { type: 'asset' as const, name, source };
						emittedFiles.push({ ...emittedFile });
						return pluginDriver.emitFile(emittedFile);
					},
					emitChunk(id, options) {
						const emittedFile = { type: 'chunk' as const, id, name: options && options.name };
						emittedFiles.push({ ...emittedFile });
						return pluginDriver.emitFile(emittedFile);
					},
					emitFile(emittedFile: EmittedFile) {
						emittedFiles.push(emittedFile);
						return pluginDriver.emitFile(emittedFile);
					},
					addWatchFile(id: string) {
						transformDependencies.push(id);
						pluginContext.addWatchFile(id);
					},
					setAssetSource() {
						return this.error({
							code: 'INVALID_SETASSETSOURCE',
							message: `setAssetSource cannot be called in transform for caching reasons. Use emitFile with a source, or call setAssetSource in another hook.`
						});
					},
					getCombinedSourcemap() {
						const combinedMap = collapseSourcemap(
							id,
							originalCode,
							originalSourcemap,
							sourcemapChain,
							warn
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
							sourcesContent: combinedMap.sourcesContent!
						});
					}
				};
			}
		)
		.catch(err => throwPluginError(err, curPlugin.name, { hook: 'transform', id }))
		.then(code => {
			if (!customTransformCache) {
				// files emitted by a transform hook need to be emitted again if the hook is skipped
				if (emittedFiles.length) module.transformFiles = emittedFiles;
			}

			return {
				ast,
				code,
				customTransformCache,
				moduleSideEffects,
				originalCode,
				originalSourcemap,
				sourcemapChain,
				syntheticNamedExports,
				transformDependencies
			};
		});
}
