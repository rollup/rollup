import { CustomPluginOptions, Plugin, ResolvedId, ResolveIdResult } from '../src/rollup/types';
import { PluginDriver } from '../src/utils/PluginDriver';
import { resolveIdViaPlugins } from '../src/utils/resolveIdViaPlugins';
import { throwNoFileSystem } from './error';

export async function resolveId(
	source: string,
	importer: string | undefined,
	_preserveSymlinks: boolean,
	pluginDriver: PluginDriver,
	moduleLoaderResolveId: (
		source: string,
		importer: string | undefined,
		customOptions: CustomPluginOptions | undefined,
		isEntry: boolean | undefined,
		skip: { importer: string | undefined; plugin: Plugin; source: string }[] | null
	) => Promise<ResolvedId | null>,
	skip: { importer: string | undefined; plugin: Plugin; source: string }[] | null,
	customOptions: CustomPluginOptions | undefined,
	isEntry: boolean
): Promise<ResolveIdResult> {
	const pluginResult = await resolveIdViaPlugins(
		source,
		importer,
		pluginDriver,
		moduleLoaderResolveId,
		skip,
		customOptions,
		isEntry
	);
	if (pluginResult == null) {
		throwNoFileSystem('path.resolve');
	}
	return pluginResult;
}
