import { InputOptions, Plugin } from '../rollup/types';
import error from './error';
import { lstatSync, readdirSync, readFileSync, realpathSync } from './fs'; // eslint-disable-line
import { basename, dirname, isAbsolute, resolve } from './path';

export function getRollupDefaultPlugin(options: InputOptions): Plugin {
	return {
		name: 'Rollup Core',
		resolveId: createResolveId(options),
		load(id) {
			return readFileSync(id, 'utf-8');
		},
		resolveDynamicImport(specifier, parentId) {
			if (typeof specifier === 'string' && !this.isExternal(specifier, parentId, false))
				return <Promise<string>>this.resolveId(specifier, parentId);
		}
	};
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
	found = findFile(file + '.mjs', preserveSymlinks);
	if (found) return found;
	found = findFile(file + '.js', preserveSymlinks);
	return found;
}

function createResolveId(options: InputOptions) {
	return function(importee: string, importer: string) {
		if (typeof process === 'undefined') {
			error({
				code: 'MISSING_PROCESS',
				message: `It looks like you're using Rollup in a non-Node.js environment. This means you must supply a plugin with custom resolveId and load functions`,
				url: 'https://rollupjs.org/guide/en#a-simple-example'
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
