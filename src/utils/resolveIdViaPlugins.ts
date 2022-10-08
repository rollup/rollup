import { ModuleLoaderResolveId } from '../ModuleLoader';
import type { CustomPluginOptions, Plugin, PluginContext, ResolveIdResult } from '../rollup/types';
import type { PluginDriver, ReplaceContext } from './PluginDriver';
import { BLANK, EMPTY_OBJECT } from './blank';

export function resolveIdViaPlugins(
	source: string,
	importer: string | undefined,
	pluginDriver: PluginDriver,
	moduleLoaderResolveId: ModuleLoaderResolveId,
	skip: readonly { importer: string | undefined; plugin: Plugin; source: string }[] | null,
	customOptions: CustomPluginOptions | undefined,
	isEntry: boolean
): Promise<ResolveIdResult> {
	let skipped: Set<Plugin> | null = null;
	let replaceContext: ReplaceContext | null = null;
	if (skip) {
		skipped = new Set();
		for (const skippedCall of skip) {
			if (source === skippedCall.source && importer === skippedCall.importer) {
				skipped.add(skippedCall.plugin);
			}
		}
		replaceContext = (pluginContext, plugin): PluginContext => ({
			...pluginContext,
			resolve: (source, importer, { custom, isEntry, skipSelf } = BLANK) => {
				return moduleLoaderResolveId(
					source,
					importer,
					custom,
					isEntry,
					// TODO Lukas use assertions provided via this.resolve
					EMPTY_OBJECT,
					skipSelf ? [...skip, { importer, plugin, source }] : skip
				);
			}
		});
	}
	return pluginDriver.hookFirst(
		'resolveId',
		[source, importer, { custom: customOptions, isEntry }],
		replaceContext,
		skipped
	);
}
