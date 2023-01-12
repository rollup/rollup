import type { ModuleLoaderResolveId } from '../../src/ModuleLoader';
import type { CustomPluginOptions, Plugin, ResolveIdResult } from '../../src/rollup/types';
import type { PluginDriver } from '../../src/utils/PluginDriver';
import { resolveIdViaPlugins } from '../../src/utils/resolveIdViaPlugins';
import { throwNoFileSystem } from './error';

export async function resolveId(
	source: string,
	importer: string | undefined,
	_preserveSymlinks: boolean,
	pluginDriver: PluginDriver,
	moduleLoaderResolveId: ModuleLoaderResolveId,
	skip: readonly { importer: string | undefined; plugin: Plugin; source: string }[] | null,
	customOptions: CustomPluginOptions | undefined,
	isEntry: boolean,
	assertions: Record<string, string>
): Promise<ResolveIdResult> {
	const pluginResult = await resolveIdViaPlugins(
		source,
		importer,
		pluginDriver,
		moduleLoaderResolveId,
		skip,
		customOptions,
		isEntry,
		assertions
	);
	if (pluginResult == null) {
		return throwNoFileSystem('path.resolve')();
	}
	return pluginResult[0];
}
