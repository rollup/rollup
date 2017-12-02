import fs from 'fs';
import path from 'path';
import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import string from 'rollup-plugin-string';
import pkg from './package.json';

const commitHash = (function() {
	try {
		return fs.readFileSync('.commithash', 'utf-8');
	} catch (err) {
		return 'unknown';
	}
})();

const banner = `/*
	Rollup.js v${pkg.version}
	${new Date()} - commit ${commitHash}

	https://github.com/rollup/rollup

	Released under the MIT License.
*/`;

const src = path.resolve('src');
const bin = path.resolve('bin');
function resolveTypescript() {
	return {
		name: 'resolve-typescript',
		resolveId(importee, importer) {
			// work around typescript's inability to resolve other extensions
			if ( ~importee.indexOf( 'help.md' ) ) return path.resolve('bin/src/help.md');
			if ( ~importee.indexOf( 'package.json' ) ) return path.resolve('package.json');

			// bit of a hack — TypeScript only really works if it can resolve imports,
			// but they misguidedly chose to reject imports with file extensions. This
			// means we need to resolve them here
			if (
				importer &&
				(importer.startsWith(src) || importer.startsWith(bin)) &&
				importee[0] === '.' &&
				path.extname(importee) === ''
			) {
				return path.resolve(path.dirname(importer), `${importee}.ts`);
			}
		}
	};
}

export default [
	/* rollup.js and rollup.es.js */
	{
		input: 'src/node-entry.ts',
		plugins: [
			json(),
			resolveTypescript(),
			typescript({
				typescript: require('typescript')
			}),
			resolve(),
			commonjs()
		],
		external: ['fs', 'path', 'events', 'module', 'fs-extra'],
		banner,
		sourcemap: true,
		output: [
			{ file: 'dist/rollup.js', format: 'cjs' },
		]
	},
];
