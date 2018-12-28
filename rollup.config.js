import fs from 'fs';
import path from 'path';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import string from 'rollup-plugin-string';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript';
import pkg from './package.json';

const commitHash = (function() {
	try {
		return fs.readFileSync('.commithash', 'utf-8');
	} catch (err) {
		return 'unknown';
	}
})();

const now = new Date(
	process.env.SOURCE_DATE_EPOCH ? process.env.SOURCE_DATE_EPOCH * 1000 : new Date().getTime()
).toUTCString();

const banner = `/*
  @license
	Rollup.js v${pkg.version}
	${now} - commit ${commitHash}

	https://github.com/rollup/rollup

	Released under the MIT License.
*/`;

const onwarn = warning => {
	if (warning.pluginCode === 'ONWRITE_HOOK_DEPRECATED')
		return;
	// eslint-disable-next-line no-console
	console.error(
		'Building Rollup produced warnings that need to be resolved. ' +
			'Please keep in mind that the browser build may never have external dependencies!'
	);
	throw new Error(warning.message);
};

const src = path.resolve('src');
const bin = path.resolve('bin');

function resolveTypescript() {
	return {
		name: 'resolve-typescript',
		resolveId(importee, importer) {
			// work around typescript's inability to resolve other extensions
			if (~importee.indexOf('help.md')) return path.resolve('bin/src/help.md');
			if (~importee.indexOf('package.json')) return path.resolve('package.json');

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

export default command => {
	const nodeBuilds = [
		/* Rollup core node builds */
		{
			input: 'src/node-entry.ts',
			onwarn,
			plugins: [
				json(),
				resolveTypescript(),
				resolve(),
				typescript(),
				commonjs()
			],
			// acorn needs to be external as some plugins rely on a shared acorn instance
			external: ['fs', 'path', 'events', 'module', 'util', 'crypto', 'acorn'],
			output: [
				{ file: 'dist/rollup.js', format: 'cjs', sourcemap: true, banner },
				{ file: 'dist/rollup.es.js', format: 'esm', banner }
			]
		},
		/* Rollup CLI */
		{
			input: 'bin/src/index.ts',
			onwarn,
			plugins: [
				string({ include: '**/*.md' }),
				json(),
				resolveTypescript(),
				resolve(),
				typescript(),
				commonjs({
					include: 'node_modules/**'
				})
			],
			external: ['fs', 'path', 'module', 'events', 'rollup', 'assert', 'os', 'util'],
			output: {
				file: 'bin/rollup',
				format: 'cjs',
				banner: '#!/usr/bin/env node',
				paths: {
					rollup: '../dist/rollup.js'
				}
			}
		}
	];

	if (command.noBrowser) {
		delete command.noBrowser;
		return nodeBuilds;
	}
	return nodeBuilds.concat([
		/* Rollup core browser builds */
		{
			input: 'src/browser-entry.ts',
			onwarn,
			plugins: [
				json(),
				{
					load: id => {
						if (~id.indexOf('fs.ts')) return fs.readFileSync('browser/fs.ts', 'utf-8');
						if (~id.indexOf('path.ts')) return fs.readFileSync('browser/path.ts', 'utf-8');
					}
				},
				resolveTypescript(),
				resolve({ browser: true }),
				typescript(),
				commonjs(),
				terser({ module: true, output: { comments: 'some' } })
			],
			output: [
				{ file: 'dist/rollup.browser.js', format: 'umd', name: 'rollup', banner },
				{ file: 'dist/rollup.browser.es.js', format: 'esm', banner }
			]
		}
	]);
};
