import MagicString, { SourceMap } from 'magic-string';
import type Module from '../Module';
import type {
	DecodedSourceMapOrMissing,
	EmittedFile,
	ExistingRawSourceMap,
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
import { getTrackedPluginCache } from './PluginCache';
import type { PluginDriver } from './PluginDriver';
import { collapseSourcemap } from './collapseSourcemaps';
import { decodedSourcemap } from './decodedSourcemap';
import {
	augmentCodeLocation,
	errInvalidSetAssetSourceCall,
	errNoTransformMapOrAstWithoutCode,
	error,
	errPluginError
} from './error';

export default async function transform(
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
	let pluginName = '';
	const curSource: string = source.code;

	function transformReducer(
		this: PluginContext,
		previousCode: string,
		result: TransformResult,
		plugin: Plugin
	): string {
		let code: string;
		let map: string | ExistingRawSourceMap | { mappings: '' } | null | undefined;
		if (typeof result === 'string') {
			code = result;
		} else if (result && typeof result === 'object') {
			module.updateOptions(result);
			if (result.code == null) {
				if (result.map || result.ast) {
					warn(errNoTransformMapOrAstWithoutCode(plugin.name));
				}
				return previousCode;
			}
			({ code, map, ast } = result);
		} else {
			return previousCode;
		}

		// strict null check allows 'null' maps to not be pushed to the chain,
		// while 'undefined' gets the missing map warning
		if (map !== null) {
			sourcemapChain.push(
				decodedSourcemap(typeof map === 'string' ? JSON.parse(map) : map) || {
					missing: true,
					plugin: plugin.name
				}
			);
		}

		return code;
	}

	let code: string;

	try {
		code = await pluginDriver.hookReduceArg0(
			'transform',
			[curSource, id],
			transformReducer,
			(pluginContext, plugin): TransformPluginContext => {
				pluginName = plugin.name;
				return {
					...pluginContext,
					addWatchFile(id: string) {
						transformDependencies.push(id);
						pluginContext.addWatchFile(id);
					},
					cache: customTransformCache
						? pluginContext.cache
						: getTrackedPluginCache(pluginContext.cache, useCustomTransformCache),
					emitFile(emittedFile: EmittedFile) {
						emittedFiles.push(emittedFile);
						return pluginDriver.emitFile(emittedFile);
					},
					error(err: RollupError | string, pos?: number | { column: number; line: number }): never {
						if (typeof err === 'string') err = { message: err };
						if (pos) augmentCodeLocation(err, pos, curSource, id);
						err.id = id;
						err.hook = 'transform';
						return pluginContext.error(err);
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
							return magicString.generateMap({ hires: true, includeContent: true, source: id });
						}
						if (originalSourcemap !== combinedMap) {
							originalSourcemap = combinedMap;
							sourcemapChain.length = 0;
						}
						return new SourceMap({
							...combinedMap,
							file: null as never,
							sourcesContent: combinedMap.sourcesContent!
						});
					},
					setAssetSource() {
						return this.error(errInvalidSetAssetSourceCall());
					},
					warn(warning: RollupWarning | string, pos?: number | { column: number; line: number }) {
						if (typeof warning === 'string') warning = { message: warning };
						if (pos) augmentCodeLocation(warning, pos, curSource, id);
						warning.id = id;
						warning.hook = 'transform';
						pluginContext.warn(warning);
					}
				};
			}
		);
	} catch (err: any) {
		return error(errPluginError(err, pluginName, { hook: 'transform', id }));
	}

	if (!customTransformCache) {
		// files emitted by a transform hook need to be emitted again if the hook is skipped
		if (emittedFiles.length) module.transformFiles = emittedFiles;
	}

	return {
		ast,
		code,
		customTransformCache,
		originalCode,
		originalSourcemap,
		sourcemapChain,
		transformDependencies
	};
}
