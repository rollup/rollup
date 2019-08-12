import fs from 'fs';
import MagicString from 'magic-string';
import path from 'path';
import alias from 'rollup-plugin-alias';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import { string } from 'rollup-plugin-string';
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
	// eslint-disable-next-line no-console
	console.error(
		'Building Rollup produced warnings that need to be resolved. ' +
			'Please keep in mind that the browser build may never have external dependencies!'
	);
	throw new Error(warning.message);
};

function addSheBang() {
	return {
		name: 'add-bin-shebang',
		renderChunk(code, chunkInfo) {
			if (chunkInfo.fileName === 'bin/rollup') {
				const magicString = new MagicString(code);
				magicString.prepend('#!/usr/bin/env node\n\n');
				return { code: magicString.toString(), map: magicString.generateMap({hires: true}) };
			}
		}
	};
}

const expectedAcornImport = "import acorn__default, { tokTypes, Parser } from 'acorn';";
const newAcornImport =
	"import * as acorn__default from 'acorn';\nimport { tokTypes, Parser } from 'acorn';";

// by default, rollup-plugin-commonjs will translate require statements as default imports
// which can cause issues for secondary tools that use the ESM version of acorn
function fixAcornEsmImport() {
	return {
		name: 'fix-acorn-esm-import',
		renderChunk(code) {
			let found = false;
			const fixedCode = code.replace(expectedAcornImport, () => {
				found = true;
				return newAcornImport;
			});
			if (!found) {
				this.error(
					'Could not find expected acorn import, please deactive this plugin and examine generated code.'
				);
			}
			return fixedCode;
		}
	};
}

const moduleAliases = {
	resolve: ['.js', '.json', '.md'],
	'acorn-dynamic-import': path.resolve('node_modules/acorn-dynamic-import/src/index.js'),
	'help.md': path.resolve('cli/help.md'),
	'package.json': path.resolve('package.json')
};

const treeshake = {
	moduleSideEffects: false,
	propertyReadSideEffects: false,
	tryCatchDeoptimization: false
};

const nodePlugins = [
	alias(moduleAliases),
	resolve(),
	json(),
	string({ include: '**/*.md' }),
	commonjs({ include: 'node_modules/**' }),
	typescript({ include: '**/*.{ts,js}' })
];

export default command => {
	const commonJSBuild = {
		input: {
			'rollup.js': 'src/node-entry.ts',
			'bin/rollup': 'cli/index.ts'
		},
		onwarn,
		plugins: [...nodePlugins, addSheBang()],
		// acorn needs to be external as some plugins rely on a shared acorn instance
		external: ['acorn', 'assert', 'events', 'fs', 'module', 'path', 'util'],
		treeshake,
		output: {
			banner,
			chunkFileNames: 'shared/[name].js',
			dir: 'dist',
			entryFileNames: '[name]',
			externalLiveBindings: false,
			format: 'cjs',
			freeze: false,
			interop: false,
			sourcemap: true
		}
	};

	if (command.configTest) {
		return commonJSBuild;
	}

	const esmBuild = Object.assign({}, commonJSBuild, {
		input: 'src/node-entry.ts',
		plugins: [...nodePlugins, fixAcornEsmImport()],
		output: { file: 'dist/rollup.es.js', format: 'esm', banner }
	});

	const browserBuilds = {
		input: 'src/browser-entry.ts',
		onwarn,
		plugins: [
			alias(moduleAliases),
			resolve({ browser: true }),
			json(),
			{
				load: id => {
					if (~id.indexOf('fs.ts')) return fs.readFileSync('browser/fs.ts', 'utf-8');
					if (~id.indexOf('path.ts')) return fs.readFileSync('browser/path.ts', 'utf-8');
				}
			},
			commonjs(),
			typescript({ include: '**/*.{ts,js}' }),
			terser({ module: true, output: { comments: 'some' } })
		],
		treeshake,
		output: [
			{ file: 'dist/rollup.browser.js', format: 'umd', name: 'rollup', banner },
			{ file: 'dist/rollup.browser.es.js', format: 'esm', banner }
		]
	};

	return [commonJSBuild, esmBuild, browserBuilds];
};
