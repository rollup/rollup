import { lstatSync, readdirSync, readFileSync, realpathSync } from './fs'; // eslint-disable-line
import { basename, dirname, isAbsolute, resolve } from './path';
import { blank } from './object';
import error from './error';
import Module from '../Module';
import ExternalModule from '../ExternalModule';
import relativeId from './relativeId';

export function load (id: string) {
	return readFileSync(id, 'utf-8');
}

function findFile (file: string): string | void {
	try {
		const stats = lstatSync(file);
		if (stats.isSymbolicLink()) return findFile(realpathSync(file));
		if (stats.isFile()) {
			// check case
			const name = basename(file);
			const files = readdirSync(dirname(file));

			if (~files.indexOf(name)) return file;
		}
	} catch (err) {
		// suppress
	}
}

function addJsExtensionIfNecessary (file: string) {
	return findFile(file) || findFile(file + '.js');
}

export function resolveId (importee: string, importer: string) {
	if (typeof process === 'undefined') {
		error({
			code: 'MISSING_PROCESS',
			message: `It looks like you're using Rollup in a non-Node.js environment. This means you must supply a plugin with custom resolveId and load functions`,
			url: 'https://github.com/rollup/rollup/wiki/Plugins'
		});
	}

	// external modules (non-entry modules that start with neither '.' or '/')
	// are skipped at this stage.
	if (importer !== undefined && !isAbsolute(importee) && importee[0] !== '.')
		return null;

	// `resolve` processes paths from right to left, prepending them until an
	// absolute path is created. Absolute importees therefore shortcircuit the
	// resolve call and require no special handing on our part.
	// See https://nodejs.org/api/path.html#path_path_resolve_paths
	return addJsExtensionIfNecessary(
		resolve(importer ? dirname(importer) : resolve(), importee)
	);
}

export function makeOnwarn () {
	const warned = blank();

	return (warning: any) => {
		const str = warning.toString();
		if (str in warned) return;
		console.error(str); //eslint-disable-line no-console
		warned[str] = true;
	};
}

export function missingExport (module: Module, name: string, otherModule: Module | ExternalModule, start?: number) {
	module.error(
		{
			code: 'MISSING_EXPORT',
			message: `'${
				name
				}' is not exported by ${relativeId(otherModule.id)}`,
			url: `https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module`
		},
		start
	);
}
