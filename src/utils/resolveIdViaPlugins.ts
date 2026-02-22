import type { ModuleLoaderResolveId } from '../ModuleLoader';
import type {
	CustomPluginOptions,
	OriginalResolveIdResult,
	Plugin,
	PluginContext
} from '../rollup/types';
import type { PluginDriver, ReplaceContext } from './PluginDriver';
import { BLANK, EMPTY_OBJECT } from './blank';

export function resolveIdViaPlugins(
	source: string,
	importer: string | undefined,
	pluginDriver: PluginDriver,
	moduleLoaderResolveId: ModuleLoaderResolveId,
	skip: readonly { importer: string | undefined; plugin: Plugin; source: string }[] | null,
	customOptions: CustomPluginOptions | undefined,
	isEntry: boolean,
	attributes: Record<string, string>,
	importerAttributes: Record<string, string> | undefined,
	importerRawId: string | undefined
): Promise<[NonNullable<OriginalResolveIdResult>, Plugin] | null> {
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
			resolve: (source, importer, { attributes, custom, isEntry, skipSelf } = BLANK) => {
				skipSelf ??= true;
				let importerId: string | undefined;
				let importerAttributes: Record<string, string> | undefined;
				let importerRawId: string | undefined;
				if (importer && typeof importer === 'object') {
					importerAttributes = importer.attributes;
					importerRawId = importer.rawId;
					importerId = undefined;
				} else {
					importerId = importer;
				}
				if (
					skipSelf &&
					skip.findIndex(skippedCall => {
						return (
							skippedCall.plugin === plugin &&
							skippedCall.source === source &&
							skippedCall.importer === importerId
						);
					}) !== -1
				) {
					// This means that the plugin recursively called itself
					// Thus returning Promise.resolve(null) in purpose of fallback to default behavior of `resolveId` plugin hook.
					return Promise.resolve(null);
				}
				return moduleLoaderResolveId(
					source,
					importerId,
					custom,
					isEntry,
					attributes || EMPTY_OBJECT,
					importerAttributes,
					importerRawId,
					skipSelf ? [...skip, { importer: importerId, plugin, source }] : skip
				);
			}
		});
	}
	return pluginDriver.hookFirstAndGetPlugin(
		'resolveId',
		[
			source,
			importer,
			{
				attributes,
				custom: customOptions,
				importerAttributes,
				importerRawId,
				isEntry
			}
		],
		replaceContext,
		skipped
	);
}
