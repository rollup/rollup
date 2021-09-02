import fs from 'fs';
import path from 'path';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import { RollupOptions, WarningHandlerWithDefault } from 'rollup';
import { string } from 'rollup-plugin-string';
import typescript from 'rollup-plugin-typescript';
import conditionalFsEventsImport from './build-plugins/conditional-fsevents-import';
import emitModulePackageFile from './build-plugins/emit-module-package-file';
import esmDynamicImport from './build-plugins/esm-dynamic-import';
import getLicenseHandler from './build-plugins/generate-license-file';
import pkg from './package.json';

const commitHash = (function () {
	try {
		return fs.readFileSync('.commithash', 'utf-8');
	} catch (err) {
		return 'unknown';
	}
})();

const now = new Date(
	process.env.SOURCE_DATE_EPOCH
		? 1000 * parseInt(process.env.SOURCE_DATE_EPOCH)
		: new Date().getTime()
).toUTCString();

const banner = `#! /usr/bin/env node
/*
  @license
	Rollup.js v${pkg.version}
	${now} - commit ${commitHash}

	https://github.com/rollup/rollup

	Released under the MIT License.
*/`;

const onwarn: WarningHandlerWithDefault = warning => {
	// eslint-disable-next-line no-console
	console.error(
		'Building Rollup produced warnings that need to be resolved. ' +
			'Please keep in mind that the browser build may never have external dependencies!'
	);
	throw new Error(warning.message);
};

const moduleAliases = {
	entries: [
		{ find: 'help.md', replacement: path.resolve('cli/help.md') },
		{ find: 'package.json', replacement: path.resolve('package.json') },
		{ find: 'acorn', replacement: path.resolve('node_modules/acorn/dist/acorn.mjs') }
	],
	resolve: ['.js', '.json', '.md']
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
	conditionalFsEventsImport(),
	string({ include: '**/*.md' }),
	commonjs({ include: 'node_modules/**' }),
	typescript()
];

export default (command: Record<string, unknown>): RollupOptions | RollupOptions[] => {
	const { collectLicenses, writeLicense } = getLicenseHandler();
	const commonJSBuild: RollupOptions = {
		// fsevents is a dependency of chokidar that cannot be bundled as it contains binary code
		external: [
			'buffer',
			'@rollup/plugin-typescript',
			'assert',
			'crypto',
			'events',
			'fs',
			'fsevents',
			'module',
			'path',
			'os',
			'stream',
			'url',
			'util'
		],
		input: 'cli/cli.ts',
		onwarn,
		output: {
			banner,
			// TODO Only loadConfigFile is using default exports mode; this should be changed in Rollup@3
			exports: 'auto',
			externalLiveBindings: false,
			file: 'dist-static/rollup',
			format: 'cjs',
			freeze: false,
			inlineDynamicImports: true,
			interop: id => {
				if (id === 'fsevents') {
					return 'defaultOnly';
				}
				return 'default';
			},
			sourcemap: false
		},
		plugins: [
			...nodePlugins,
			esmDynamicImport(),
			// TODO this relied on an unpublished type update
			(!command.configTest && collectLicenses()) as Plugin
		],
		strictDeprecations: true,
		treeshake
	};

	return [commonJSBuild];
};
