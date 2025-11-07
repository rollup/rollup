import MagicString, { SourceMap } from 'magic-string';
import type Module from '../Module';
import type {
	DecodedSourceMapOrMissing,
	EmittedFile,
	ExistingRawSourceMap,
	LoggingFunctionWithPosition,
	LogHandler,
	Plugin,
	PluginContext,
	RollupError,
	SourceDescription,
	TransformModuleJSON,
	TransformPluginContext,
	TransformResult
} from '../rollup/types';
import { getTrackedPluginCache } from './PluginCache';
import type { PluginDriver } from './PluginDriver';
import { collapseSourcemap } from './collapseSourcemaps';
import { decodedSourcemap } from './decodedSourcemap';
import { LOGLEVEL_WARN } from './logging';
import {
	augmentCodeLocation,
	error,
	logInvalidSetAssetSourceCall,
	logNoTransformMapOrAstWithoutCode,
	logPluginError
} from './logs';
import { normalizeLog } from './options/options';

export default async function transform(
	source: SourceDescription,
	module: Module,
	pluginDriver: PluginDriver,
	log: LogHandler
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
	let currentSource = source.code;

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
					log(LOGLEVEL_WARN, logNoTransformMapOrAstWithoutCode(plugin.name));
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

		currentSource = code;

		return code;
	}

	const getLogHandler =
		(handler: LoggingFunctionWithPosition): LoggingFunctionWithPosition =>
		(log, pos) => {
			log = normalizeLog(log);
			if (pos) augmentCodeLocation(log, pos, currentSource, id);
			log.id = id;
			log.hook = 'transform';
			handler(log);
		};

	let code: string;

	try {
		code = await pluginDriver.hookReduceArg0(
			'transform',
			[currentSource, id],
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
					debug: getLogHandler(pluginContext.debug),
					emitFile(emittedFile: EmittedFile) {
						emittedFiles.push(emittedFile);
						return pluginDriver.emitFile(emittedFile);
					},
					error(
						error_: RollupError | string,
						pos?: number | { column: number; line: number }
					): never {
						if (typeof error_ === 'string') error_ = { message: error_ };
						if (pos) augmentCodeLocation(error_, pos, currentSource, id);
						error_.id = id;
						error_.hook = 'transform';
						return pluginContext.error(error_);
					},
					getCombinedSourcemap() {
						const combinedMap = collapseSourcemap(
							id,
							originalCode,
							originalSourcemap,
							sourcemapChain,
							log
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
					info: getLogHandler(pluginContext.info),
					setAssetSource() {
						return this.error(logInvalidSetAssetSourceCall());
					},
					warn: getLogHandler(pluginContext.warn)
				};
			}
		);
	} catch (error_: any) {
		return error(logPluginError(error_, pluginName, { hook: 'transform', id }));
	}

	if (
		!customTransformCache && // files emitted by a transform hook need to be emitted again if the hook is skipped
		emittedFiles.length > 0
	)
		module.transformFiles = emittedFiles;

	return {
		ast,
		code,
		customTransformCache,
		originalCode,
		originalSourcemap,
		safeVariableNames: null,
		sourcemapChain,
		transformDependencies
	};
}
