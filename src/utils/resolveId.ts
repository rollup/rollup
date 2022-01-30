import type { CustomPluginOptions, Plugin, ResolvedId, ResolveIdResult } from '../rollup/types';
import type { PluginDriver } from './PluginDriver';
import { lstatSync, readdirSync, realpathSync } from './fs';
import { basename, dirname, isAbsolute, resolve } from './path';
import { resolveIdViaPlugins } from './resolveIdViaPlugins';

export async function resolveId(
	source: string,
	importer: string | undefined,
	preserveSymlinks: boolean,
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
	const pluginResult = await resolveIdViaPlugins(
		source,
		importer,
		pluginDriver,
		moduleLoaderResolveId,
		skip,
		customOptions,
		isEntry
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
		importer ? resolve(dirname(importer), source) : resolve(source),
		preserveSymlinks
	);
}

function addJsExtensionIfNecessary(file: string, preserveSymlinks: boolean): string | undefined {
	return (
		findFile(file, preserveSymlinks) ??
		findFile(file + '.mjs', preserveSymlinks) ??
		findFile(file + '.js', preserveSymlinks)
	);
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

			if (files.includes(name)) return file;
		}
	} catch {
		// suppress
	}
}
