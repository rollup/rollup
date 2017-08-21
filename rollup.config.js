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
	}
}

export default [
	/* rollup.js and rollup.es.js */
	{
		input: 'src/node-entry.js',
		plugins: [
			json(),
			resolveTypescript(),
			typescript({
				typescript: require('typescript')
			}),
			resolve(),
			commonjs()
		],
		external: ['fs', 'path', 'events', 'module'],
		banner,
		sourcemap: true,
		output: [
			{ file: 'dist/rollup.js', format: 'cjs' },
			{ file: 'dist/rollup.es.js', format: 'es' }
		]
	},

	/* rollup.browser.js */
	{
		input: 'src/browser-entry.js',
		plugins: [
			json(),
			{
				load: id => {
					if ( ~id.indexOf( 'fs.ts' ) ) return fs.readFileSync( 'browser/fs.ts', 'utf-8' );
					if ( ~id.indexOf( 'path.ts' ) ) return fs.readFileSync( 'browser/path.ts', 'utf-8' );
				}
			},
			resolveTypescript(),
			typescript({
				typescript: require('typescript')
			}),
			resolve(),
			commonjs()
		],
		banner,
		sourcemap: true,
		output: [
			{
				file: 'dist/rollup.browser.js',
				format: 'umd',
				name: 'rollup'
			}
		]
	},

	/* bin/rollup */
	{
		input: 'bin/src/index.js',
		plugins: [
			string({ include: '**/*.md' }),
			json(),
			resolveTypescript(),
			typescript({
				typescript: require('typescript')
			}),
			commonjs({
				include: 'node_modules/**'
			}),
			resolve()
		],
		external: [
			'fs',
			'path',
			'module',
			'events',
			'rollup',
			'assert',
			'os'
		],
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
