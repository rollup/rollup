import { readFileSync } from 'fs';
import buble from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import string from 'rollup-plugin-string';
import pkg from './package.json';

const commitHash = (function() {
	try {
		return readFileSync('.commithash', 'utf-8');
	} catch (err) {
		return 'unknown';
	}
})();

const banner = readFileSync('src/banner.js', 'utf-8')
	.replace('${version}', pkg.version)
	.replace('${time}', new Date())
	.replace('${commitHash}', commitHash);

export default [
	/* rollup.js and rollup.es.js */
	{
		input: 'src/node-entry.js',
		plugins: [
			json(),
			buble({
				include: ['src/**', 'node_modules/acorn/**'],
				target: {
					node: '4'
				}
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
			buble({
				include: ['src/**', 'node_modules/acorn/**'],
				target: {
					node: '4'
				}
			}),
			resolve(),
			commonjs(),
			{
				load: id => {
					if ( ~id.indexOf( 'fs.js' ) ) return readFileSync( 'browser/fs.js', 'utf-8' );
					if ( ~id.indexOf( 'path.js' ) ) return readFileSync( 'browser/path.js', 'utf-8' );
				}
			}
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
			buble({ target: { node: 4 } }),
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
