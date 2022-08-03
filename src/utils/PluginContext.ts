import { version as rollupVersion } from 'package.json';
import type Graph from '../Graph';
import type {
	NormalizedInputOptions,
	Plugin,
	PluginCache,
	PluginContext,
	SerializablePluginCache
} from '../rollup/types';
import type { FileEmitter } from './FileEmitter';
import { createPluginCache, getCacheForUncacheablePlugin, NO_CACHE } from './PluginCache';
import { BLANK } from './blank';
import { BuildPhase } from './buildPhase';
import { errInvalidRollupPhaseForAddWatchFile, warnDeprecation } from './error';
import {
	ANONYMOUS_OUTPUT_PLUGIN_PREFIX,
	ANONYMOUS_PLUGIN_PREFIX,
	throwPluginError
} from './pluginUtils';

function getDeprecatedContextHandler<
	THandler extends (...args: TParams) => TResult,
	TParams extends readonly any[],
	TResult
>(
	handler: THandler,
	handlerName: string,
	newHandlerName: string,
	pluginName: string,
	activeDeprecation: boolean,
	options: NormalizedInputOptions
): THandler {
	let deprecationWarningShown = false;
	return ((...args: TParams): TResult => {
		if (!deprecationWarningShown) {
			deprecationWarningShown = true;
			warnDeprecation(
				{
					message: `The "this.${handlerName}" plugin context function used by plugin ${pluginName} is deprecated. The "this.${newHandlerName}" plugin context function should be used instead.`,
					plugin: pluginName
				},
				activeDeprecation,
				options
			);
		}
		return handler(...args);
	}) as THandler;
}

export function getPluginContext(
	plugin: Plugin,
	pluginCache: Record<string, SerializablePluginCache> | void,
	graph: Graph,
	options: NormalizedInputOptions,
	fileEmitter: FileEmitter,
	existingPluginNames: Set<string>
): PluginContext {
	let cacheable = true;
	if (typeof plugin.cacheKey !== 'string') {
		if (
			plugin.name.startsWith(ANONYMOUS_PLUGIN_PREFIX) ||
			plugin.name.startsWith(ANONYMOUS_OUTPUT_PLUGIN_PREFIX) ||
			existingPluginNames.has(plugin.name)
		) {
			cacheable = false;
		} else {
			existingPluginNames.add(plugin.name);
		}
	}

	let cacheInstance: PluginCache;
	if (!pluginCache) {
		cacheInstance = NO_CACHE;
	} else if (cacheable) {
		const cacheKey = plugin.cacheKey || plugin.name;
		cacheInstance = createPluginCache(
			pluginCache[cacheKey] || (pluginCache[cacheKey] = Object.create(null))
		);
	} else {
		cacheInstance = getCacheForUncacheablePlugin(plugin.name);
	}

	return {
		addWatchFile(id) {
			if (graph.phase >= BuildPhase.GENERATE) {
				return this.error(errInvalidRollupPhaseForAddWatchFile());
			}
			graph.watchFiles[id] = true;
		},
		cache: cacheInstance,
		emitAsset: getDeprecatedContextHandler(
			(name: string, source?: string | Uint8Array) =>
				fileEmitter.emitFile({ name, source, type: 'asset' }),
			'emitAsset',
			'emitFile',
			plugin.name,
			true,
			options
		),
		emitChunk: getDeprecatedContextHandler(
			(id: string, options?: { name?: string }) =>
				fileEmitter.emitFile({ id, name: options && options.name, type: 'chunk' }),
			'emitChunk',
			'emitFile',
			plugin.name,
			true,
			options
		),
		emitFile: fileEmitter.emitFile.bind(fileEmitter),
		error(err): never {
			return throwPluginError(err, plugin.name);
		},
		getAssetFileName: getDeprecatedContextHandler(
			fileEmitter.getFileName,
			'getAssetFileName',
			'getFileName',
			plugin.name,
			true,
			options
		),
		getChunkFileName: getDeprecatedContextHandler(
			fileEmitter.getFileName,
			'getChunkFileName',
			'getFileName',
			plugin.name,
			true,
			options
		),
		getFileName: fileEmitter.getFileName,
		getModuleIds: () => graph.modulesById.keys(),
		getModuleInfo: graph.getModuleInfo,
		getWatchFiles: () => Object.keys(graph.watchFiles),
		isExternal: getDeprecatedContextHandler(
			(id: string, parentId: string | undefined, isResolved = false) =>
				options.external(id, parentId, isResolved),
			'isExternal',
			'resolve',
			plugin.name,
			true,
			options
		),
		load(resolvedId) {
			return graph.moduleLoader.preloadModule(resolvedId);
		},
		meta: {
			rollupVersion,
			watchMode: graph.watchMode
		},
		get moduleIds() {
			function* wrappedModuleIds() {
				// We are wrapping this in a generator to only show the message once we are actually iterating
				warnDeprecation(
					{
						message: `Accessing "this.moduleIds" on the plugin context by plugin ${plugin.name} is deprecated. The "this.getModuleIds" plugin context function should be used instead.`,
						plugin: plugin.name
					},
					false,
					options
				);
				yield* moduleIds;
			}

			const moduleIds = graph.modulesById.keys();
			return wrappedModuleIds();
		},
		parse: graph.contextParse.bind(graph),
		resolve(source, importer, { custom, isEntry, skipSelf } = BLANK) {
			return graph.moduleLoader.resolveId(
				source,
				importer,
				custom,
				isEntry,
				skipSelf ? [{ importer, plugin, source }] : null
			);
		},
		resolveId: getDeprecatedContextHandler(
			(source: string, importer: string | undefined) =>
				graph.moduleLoader
					.resolveId(source, importer, BLANK, undefined)
					.then(resolveId => resolveId && resolveId.id),
			'resolveId',
			'resolve',
			plugin.name,
			true,
			options
		),
		setAssetSource: fileEmitter.setAssetSource,
		warn(warning) {
			if (typeof warning === 'string') warning = { message: warning };
			if (warning.code) warning.pluginCode = warning.code;
			warning.code = 'PLUGIN_WARNING';
			warning.plugin = plugin.name;
			options.onwarn(warning);
		}
	};
}
