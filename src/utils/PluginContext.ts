import { version as rollupVersion } from 'package.json';
import ExternalModule from '../ExternalModule';
import Graph from '../Graph';
import Module from '../Module';
import {
	Plugin,
	PluginCache,
	PluginContext,
	RollupWarning,
	SerializablePluginCache
} from '../rollup/types';
import { BuildPhase } from './buildPhase';
import { errInvalidRollupPhaseForAddWatchFile } from './error';
import { FileEmitter } from './FileEmitter';
import { createPluginCache, getCacheForUncacheablePlugin, NO_CACHE } from './PluginCache';
import {
	ANONYMOUS_OUTPUT_PLUGIN_PREFIX,
	ANONYMOUS_PLUGIN_PREFIX,
	throwPluginError
} from './pluginUtils';

function getDeprecatedContextHandler<H extends Function>(
	handler: H,
	handlerName: string,
	newHandlerName: string,
	pluginName: string,
	activeDeprecation: boolean,
	graph: Graph
): H {
	let deprecationWarningShown = false;
	return (((...args: any[]) => {
		if (!deprecationWarningShown) {
			deprecationWarningShown = true;
			graph.warnDeprecation(
				{
					message: `The "this.${handlerName}" plugin context function used by plugin ${pluginName} is deprecated. The "this.${newHandlerName}" plugin context function should be used instead.`,
					plugin: pluginName
				},
				activeDeprecation
			);
		}
		return handler(...args);
	}) as unknown) as H;
}

export function getPluginContexts(
	pluginCache: Record<string, SerializablePluginCache> | void,
	graph: Graph,
	fileEmitter: FileEmitter
): (plugin: Plugin, pluginIndex: number) => PluginContext {
	const existingPluginNames = new Set<string>();
	return (plugin, pidx) => {
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

		const context: PluginContext = {
			addWatchFile(id) {
				if (graph.phase >= BuildPhase.GENERATE) {
					return this.error(errInvalidRollupPhaseForAddWatchFile());
				}
				graph.watchFiles[id] = true;
			},
			cache: cacheInstance,
			emitAsset: getDeprecatedContextHandler(
				(name: string, source?: string | Uint8Array) =>
					fileEmitter.emitFile({ type: 'asset', name, source }),
				'emitAsset',
				'emitFile',
				plugin.name,
				true,
				graph
			),
			emitChunk: getDeprecatedContextHandler(
				(id: string, options?: { name?: string }) =>
					fileEmitter.emitFile({ type: 'chunk', id, name: options && options.name }),
				'emitChunk',
				'emitFile',
				plugin.name,
				true,
				graph
			),
			emitFile: fileEmitter.emitFile,
			error(err): never {
				return throwPluginError(err, plugin.name);
			},
			getAssetFileName: getDeprecatedContextHandler(
				fileEmitter.getFileName,
				'getAssetFileName',
				'getFileName',
				plugin.name,
				true,
				graph
			),
			getChunkFileName: getDeprecatedContextHandler(
				fileEmitter.getFileName,
				'getChunkFileName',
				'getFileName',
				plugin.name,
				true,
				graph
			),
			getFileName: fileEmitter.getFileName,
			getModuleInfo(moduleId) {
				const foundModule = graph.moduleById.get(moduleId);
				if (foundModule == null) {
					throw new Error(`Unable to find module ${moduleId}`);
				}
				const importedIds: string[] = [];
				const dynamicallyImportedIds: string[] = [];
				if (foundModule instanceof Module) {
					for (const source of foundModule.sources) {
						importedIds.push(foundModule.resolvedIds[source].id);
					}
					for (const { resolution } of foundModule.dynamicImports) {
						if (resolution instanceof Module || resolution instanceof ExternalModule) {
							dynamicallyImportedIds.push(resolution.id);
						}
					}
				}
				return {
					dynamicallyImportedIds,
					hasModuleSideEffects: foundModule.moduleSideEffects,
					id: foundModule.id,
					importedIds,
					isEntry: foundModule instanceof Module && foundModule.isEntryPoint,
					isExternal: foundModule instanceof ExternalModule
				};
			},
			isExternal: getDeprecatedContextHandler(
				(id: string, parentId: string | undefined, isResolved = false) =>
					graph.moduleLoader.isExternal(id, parentId, isResolved),
				'isExternal',
				'resolve',
				plugin.name,
				true,
				graph
			),
			meta: {
				rollupVersion
			},
			get moduleIds() {
				return graph.moduleById.keys();
			},
			parse: graph.contextParse,
			resolve(source, importer, options?: { skipSelf: boolean }) {
				return graph.moduleLoader.resolveId(
					source,
					importer,
					options && options.skipSelf ? pidx : null
				);
			},
			resolveId: getDeprecatedContextHandler(
				(source: string, importer: string | undefined) =>
					graph.moduleLoader
						.resolveId(source, importer)
						.then(resolveId => resolveId && resolveId.id),
				'resolveId',
				'resolve',
				plugin.name,
				true,
				graph
			),
			setAssetSource: fileEmitter.setAssetSource,
			warn(warning) {
				if (typeof warning === 'string') warning = { message: warning } as RollupWarning;
				if (warning.code) warning.pluginCode = warning.code;
				warning.code = 'PLUGIN_WARNING';
				warning.plugin = plugin.name;
				graph.warn(warning);
			}
		};
		return context;
	};
}
