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
import { BLANK, EMPTY_OBJECT } from './blank';
import { BuildPhase } from './buildPhase';
import { getLogHandler } from './logHandler';
import { LOGLEVEL_DEBUG, LOGLEVEL_INFO, LOGLEVEL_WARN } from './logging';
import {
	error,
	logInvalidRollupPhaseForAddWatchFile,
	logPluginError,
	warnDeprecation
} from './logs';
import { normalizeLog } from './options/options';
import { ANONYMOUS_OUTPUT_PLUGIN_PREFIX, ANONYMOUS_PLUGIN_PREFIX } from './pluginUtils';
import { URL_THIS_GETMODULEIDS } from './urls';

export function getPluginContext(
	plugin: Plugin,
	pluginCache: Record<string, SerializablePluginCache> | void,
	graph: Graph,
	options: NormalizedInputOptions,
	fileEmitter: FileEmitter,
	existingPluginNames: Set<string>
): PluginContext {
	const { logLevel, onLog } = options;
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
				return this.error(logInvalidRollupPhaseForAddWatchFile());
			}
			graph.watchFiles[id] = true;
		},
		cache: cacheInstance,
		debug: getLogHandler(LOGLEVEL_DEBUG, 'PLUGIN_LOG', onLog, plugin.name, logLevel),
		emitFile: fileEmitter.emitFile.bind(fileEmitter),
		error(error_): never {
			return error(logPluginError(normalizeLog(error_), plugin.name));
		},
		getFileName: fileEmitter.getFileName,
		getModuleIds: () => graph.modulesById.keys(),
		getModuleInfo: graph.getModuleInfo,
		getWatchFiles: () => Object.keys(graph.watchFiles),
		info: getLogHandler(LOGLEVEL_INFO, 'PLUGIN_LOG', onLog, plugin.name, logLevel),
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
					`Accessing "this.moduleIds" on the plugin context by plugin ${plugin.name} is deprecated. The "this.getModuleIds" plugin context function should be used instead.`,
					URL_THIS_GETMODULEIDS,
					true,
					options,
					plugin.name
				);
				yield* moduleIds;
			}

			const moduleIds = graph.modulesById.keys();
			return wrappedModuleIds();
		},
		parse: graph.contextParse.bind(graph),
		resolve(source, importer, { assertions, custom, isEntry, skipSelf } = BLANK) {
			return graph.moduleLoader.resolveId(
				source,
				importer,
				custom,
				isEntry,
				assertions || EMPTY_OBJECT,
				skipSelf ? [{ importer, plugin, source }] : null
			);
		},
		setAssetSource: fileEmitter.setAssetSource,
		warn: getLogHandler(LOGLEVEL_WARN, 'PLUGIN_WARNING', onLog, plugin.name, logLevel)
	};
}
