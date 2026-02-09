import { version as rollupVersion } from 'package.json';
import { parseAndWalk as parseAndWalkNative } from '../../native';
import { nodeIds } from '../ast/nodeIds';
import { nodeTypeStrings } from '../ast/nodeTypeStrings';
import type Graph from '../Graph';
import type {
	NormalizedInputOptions,
	Plugin,
	PluginCache,
	PluginContext,
	SerializablePluginCache
} from '../rollup/types';
import { BLANK, EMPTY_OBJECT } from './blank';
import { deserializeLazyAstBuffer } from './bufferToAst';
import type { FileEmitter } from './FileEmitter';
import { getAstBuffer } from './getAstBuffer';
import { LOGLEVEL_DEBUG, LOGLEVEL_INFO, LOGLEVEL_WARN } from './logging';
import { getLogHandler } from './logHandler';
import { error, logPluginError } from './logs';
import { normalizeLog } from './options/options';
import { parseAst } from './parseAst';
import { createPluginCache, getCacheForUncacheablePlugin, NO_CACHE } from './PluginCache';
import { ANONYMOUS_OUTPUT_PLUGIN_PREFIX, ANONYMOUS_PLUGIN_PREFIX } from './pluginNames';

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
			graph.watchFiles[id] = true;
		},
		cache: cacheInstance,
		debug: getLogHandler(LOGLEVEL_DEBUG, 'PLUGIN_LOG', onLog, plugin.name, logLevel),
		emitFile: fileEmitter.emitFile.bind(fileEmitter),
		error(error_): never {
			return error(logPluginError(normalizeLog(error_), plugin.name));
		},
		fs: options.fs,
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
		parse: parseAst,
		async parseAndWalk(input, visitors, { allowReturnOutsideFunction = false, jsx = false } = {}) {
			const bitset = new BigUint64Array(2); // 2 × 64 bits = 128 bits

			for (const nodeType of Object.keys(visitors)) {
				const ids = nodeIds[nodeType];
				if (ids) {
					for (const id of ids) {
						const wordIndex = id >> 6; // 0 or 1
						const bitIndex = id % 64;
						bitset[wordIndex] |= 1n << BigInt(bitIndex);
					}
				}
			}

			const astBuffer = getAstBuffer(
				await parseAndWalkNative(
					input,
					allowReturnOutsideFunction,
					jsx,
					// TODO Lukas can we directly pass Uint64?
					new Uint8Array(bitset.buffer)
				)
			);

			// TODO Lukas verify walkingInfo offset is native endian
			for (
				let walkingPosition = astBuffer[0];
				walkingPosition < astBuffer.length;
				walkingPosition += 2
			) {
				const elementIndex = astBuffer[walkingPosition];
				const nodeTypeString = nodeTypeStrings[astBuffer[elementIndex]];
				visitors[nodeTypeString]!(deserializeLazyAstBuffer(astBuffer, elementIndex) as any, {
					parseChildren() {},
					skipChildren() {}
				});
			}
		},
		resolve(
			source,
			importer,
			{ attributes, custom, isEntry, skipSelf, importerAttributes } = BLANK
		) {
			skipSelf ??= true;
			return graph.moduleLoader.resolveId(
				source,
				importer,
				custom,
				isEntry,
				attributes || EMPTY_OBJECT,
				importerAttributes,
				skipSelf ? [{ importer, plugin, source }] : null
			);
		},
		setAssetSource: fileEmitter.setAssetSource,
		warn: getLogHandler(LOGLEVEL_WARN, 'PLUGIN_WARNING', onLog, plugin.name, logLevel)
	};
}
