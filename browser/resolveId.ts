import { CustomPluginOptions } from '../src/rollup/types';
import { PluginDriver } from '../src/utils/PluginDriver';
import { throwNoFileSystem } from './error';

export async function resolveId(
	source: string,
	importer: string | undefined,
	_preserveSymlinks: boolean,
	pluginDriver: PluginDriver,
	skip: number | null,
	customOptions: CustomPluginOptions | undefined
) {
	const pluginResult = await pluginDriver.hookFirst(
		'resolveId',
		[source, importer, { custom: customOptions }],
		null,
		skip
	);
	if (pluginResult == null) {
		throwNoFileSystem('path.resolve');
	}
	return pluginResult;
}
