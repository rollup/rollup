import type { ModuleLoaderResolveId } from '../ModuleLoader';
import type { CustomPluginOptions, Plugin, ResolveIdResult } from '../rollup/types';
import type { PluginDriver } from './PluginDriver';
import { lstat, readdir, realpath } from './fs';
import { basename, dirname, isAbsolute, resolve } from './path';
import { resolveIdViaPlugins } from './resolveIdViaPlugins';

export async function resolveId(
	source: string,
	importer: string | undefined,
	preserveSymlinks: boolean,
	pluginDriver: PluginDriver,
	moduleLoaderResolveId: ModuleLoaderResolveId,
	skip: readonly { importer: string | undefined; plugin: Plugin; source: string }[] | null,
	customOptions: CustomPluginOptions | undefined,
	isEntry: boolean,
	attributes: Record<string, string>
): Promise<ResolveIdResult> {
	const pluginResult = await resolveIdViaPlugins(
		source,
		importer,
		pluginDriver,
		moduleLoaderResolveId,
		skip,
		customOptions,
		isEntry,
		attributes
	);

	if (pluginResult != null) {
		const [resolveIdResult, plugin] = pluginResult;
		if (typeof resolveIdResult === 'object' && !resolveIdResult.resolvedBy) {
			return {
				...resolveIdResult,
				resolvedBy: plugin.name
			};
		}
		if (typeof resolveIdResult === 'string') {
			return {
				id: resolveIdResult,
				resolvedBy: plugin.name
			};
		}
		return resolveIdResult;
	}

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

async function addJsExtensionIfNecessary(
	file: string,
	preserveSymlinks: boolean
): Promise<string | undefined> {
	return (
		(await findFile(file, preserveSymlinks)) ??
		(await findFile(file + '.mjs', preserveSymlinks)) ??
		(await findFile(file + '.js', preserveSymlinks))
	);
}

async function findFile(file: string, preserveSymlinks: boolean): Promise<string | undefined> {
	try {
		const stats = await lstat(file);
		if (!preserveSymlinks && stats.isSymbolicLink())
			return await findFile(await realpath(file), preserveSymlinks);
		if ((preserveSymlinks && stats.isSymbolicLink()) || stats.isFile()) {
			// check case
			const name = basename(file);
			const files = await readdir(dirname(file));

			if (files.includes(name)) return file;
		}
	} catch {
		// suppress
	}
}
