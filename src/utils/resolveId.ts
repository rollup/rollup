import { CustomPluginOptions } from '../rollup/types';
import { lstatSync, readdirSync, realpathSync } from './fs';
import { basename, dirname, isAbsolute, resolve } from './path';
import { PluginDriver } from './PluginDriver';

export async function resolveId(
	source: string,
	importer: string | undefined,
	preserveSymlinks: boolean,
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
	if (pluginResult != null) return pluginResult;

	// external modules (non-entry modules that start with neither '.' or '/')
	// are skipped at this stage.
	if (importer !== undefined && !isAbsolute(source) && source[0] !== '.') return null;

	// `resolve` processes paths from right to left, prepending them until an
	// absolute path is created. Absolute importees therefore shortcircuit the
	// resolve call and require no special handing on our part.
	// See https://nodejs.org/api/path.html#path_path_resolve_paths
	return addJsExtensionIfNecessary(
		resolve(importer ? dirname(importer) : resolve(), source),
		preserveSymlinks
	);
}

function addJsExtensionIfNecessary(file: string, preserveSymlinks: boolean) {
	let found = findFile(file, preserveSymlinks);
	if (found) return found;
	found = findFile(file + '.mjs', preserveSymlinks);
	if (found) return found;
	found = findFile(file + '.js', preserveSymlinks);
	return found;
}

function findFile(file: string, preserveSymlinks: boolean): string | undefined {
	try {
		const stats = lstatSync(file);
		if (!preserveSymlinks && stats.isSymbolicLink())
			return findFile(realpathSync(file), preserveSymlinks);
		if ((preserveSymlinks && stats.isSymbolicLink()) || stats.isFile()) {
			// check case
			const name = basename(file);
			const files = readdirSync(dirname(file));

			if (files.indexOf(name) !== -1) return file;
		}
	} catch {
		// suppress
	}
}
