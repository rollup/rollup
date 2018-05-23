import { lstatSync, readdirSync, readFileSync, realpathSync } from './fs'; // eslint-disable-line
import { basename, dirname, isAbsolute, resolve } from './path';
import error from './error';
import Module from '../Module';
import relativeId from './relativeId';
import { InputOptions } from '../rollup/types';

export function load(id: string) {
	return readFileSync(id, 'utf-8');
}

function findFile(file: string, preserveSymlinks: boolean): string | void {
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
	} catch (err) {
		// suppress
	}
}

function addJsExtensionIfNecessary(file: string, preserveSymlinks: boolean) {
	let found = findFile(file, preserveSymlinks);
	if (found) return found;
	found = findFile(file + '.js', preserveSymlinks);
	if (found) return found;
	return findFile(file + '.mjs', preserveSymlinks);
}

export function resolveId(options: InputOptions) {
	return function(importee: string, importer: string) {
		if (typeof process === 'undefined') {
			error({
				code: 'MISSING_PROCESS',
				message: `It looks like you're using Rollup in a non-Node.js environment. This means you must supply a plugin with custom resolveId and load functions`,
				url: 'https://github.com/rollup/rollup/wiki/Plugins'
			});
		}

		// external modules (non-entry modules that start with neither '.' or '/')
		// are skipped at this stage.
		if (importer !== undefined && !isAbsolute(importee) && importee[0] !== '.') return null;

		// `resolve` processes paths from right to left, prepending them until an
		// absolute path is created. Absolute importees therefore shortcircuit the
		// resolve call and require no special handing on our part.
		// See https://nodejs.org/api/path.html#path_path_resolve_paths
		return addJsExtensionIfNecessary(
			resolve(importer ? dirname(importer) : resolve(), importee),
			options.preserveSymlinks
		);
	};
}

export function makeOnwarn() {
	const warned = Object.create(null);

	return (warning: any) => {
		const str = warning.toString();
		if (str in warned) return;
		console.error(str); //eslint-disable-line no-console
		warned[str] = true;
	};
}

export function handleMissingExport(
	exportName: string,
	importingModule: Module,
	importedModule: string,
	importerStart?: number
) {
	importingModule.error(
		{
			code: 'MISSING_EXPORT',
			message: `'${exportName}' is not exported by ${relativeId(importedModule)}`,
			url: `https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module`
		},
		importerStart
	);
}
