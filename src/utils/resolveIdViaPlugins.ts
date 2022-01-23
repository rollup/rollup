import {
	CustomPluginOptions,
	Plugin,
	PluginContext,
	ResolvedId,
	ResolveIdResult
} from '../rollup/types';
import { PluginDriver, ReplaceContext } from './PluginDriver';
import { BLANK } from './blank';

export function resolveIdViaPlugins(
	source: string,
	importer: string | undefined,
	pluginDriver: PluginDriver,
	moduleLoaderResolveId: (
		source: string,
		importer: string | undefined,
		customOptions: CustomPluginOptions | undefined,
		isEntry: boolean | undefined,
		skip: readonly { importer: string | undefined; plugin: Plugin; source: string }[] | null
	) => Promise<ResolvedId | null>,
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
