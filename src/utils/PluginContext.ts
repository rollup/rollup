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
import {
	errInvalidRollupPhaseForAddWatchFile,
	error,
	errPluginError,
	warnDeprecation
} from './error';
import { ANONYMOUS_OUTPUT_PLUGIN_PREFIX, ANONYMOUS_PLUGIN_PREFIX } from './pluginUtils';

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
		emitFile: fileEmitter.emitFile.bind(fileEmitter),
		error(err): never {
			return error(errPluginError(err, plugin.name));
		},
		getFileName: fileEmitter.getFileName,
		getModuleIds: () => graph.modulesById.keys(),
		getModuleInfo: graph.getModuleInfo,
		getWatchFiles: () => Object.keys(graph.watchFiles),
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
					true,
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
