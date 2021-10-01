import fs from 'fs';
import path from 'path';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { RollupOptions, WarningHandlerWithDefault } from 'rollup';
import { string } from 'rollup-plugin-string';
import { terser } from 'rollup-plugin-terser';
import addCliEntry from './build-plugins/add-cli-entry';
import conditionalFsEventsImport from './build-plugins/conditional-fsevents-import';
import emitModulePackageFile from './build-plugins/emit-module-package-file';
import esmDynamicImport from './build-plugins/esm-dynamic-import';
import getLicenseHandler from './build-plugins/generate-license-file';
import replaceBrowserModules from './build-plugins/replace-browser-modules';
import pkg from './package.json';

const commitHash = (function () {
	try {
		return fs.readFileSync('.commithash', 'utf-8');
	} catch {
		return 'unknown';
	}
})();

const now = new Date(
	process.env.SOURCE_DATE_EPOCH
		? 1000 * parseInt(process.env.SOURCE_DATE_EPOCH)
		: new Date().getTime()
).toUTCString();

const banner = `/*
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
		input: {
			'loadConfigFile.js': 'cli/run/loadConfigFile.ts',
			'rollup.js': 'src/node-entry.ts'
		},
		onwarn,
		output: {
			banner,
			chunkFileNames: 'shared/[name].js',
			dir: 'dist',
			entryFileNames: '[name]',
			// TODO Only loadConfigFile is using default exports mode; this should be changed in Rollup@3
			exports: 'auto',
			externalLiveBindings: false,
			format: 'cjs',
			freeze: false,
			generatedCode: 'es2015',
			interop: id => {
				if (id === 'fsevents') {
					return 'defaultOnly';
				}
				return 'default';
			},
			manualChunks: { rollup: ['src/node-entry.ts'] },
			sourcemap: true
		},
		plugins: [
			...nodePlugins,
			addCliEntry(),
			esmDynamicImport(),
			// TODO this relied on an unpublished type update
			(!command.configTest && collectLicenses()) as Plugin
		],
		strictDeprecations: true,
		treeshake
	};

	if (command.configTest) {
		return commonJSBuild;
	}

	const esmBuild: RollupOptions = {
		...commonJSBuild,
		input: { 'rollup.js': 'src/node-entry.ts' },
		output: {
			...commonJSBuild.output,
			dir: 'dist/es',
			format: 'es',
			minifyInternalExports: false,
			sourcemap: false
		},
		plugins: [...nodePlugins, emitModulePackageFile(), collectLicenses()]
	};

	const browserBuilds: RollupOptions = {
		input: 'src/browser-entry.ts',
		onwarn,
		output: [
			{ banner, file: 'dist/rollup.browser.js', format: 'umd', name: 'rollup', sourcemap: true },
			{ banner, file: 'dist/es/rollup.browser.js', format: 'es' }
		],
		plugins: [
			replaceBrowserModules(),
			alias(moduleAliases),
			resolve({ browser: true }),
			json(),
			commonjs(),
			typescript(),
			terser({ module: true, output: { comments: 'some' } }),
			collectLicenses(),
			writeLicense()
		],
		strictDeprecations: true,
		treeshake
	};

	return [commonJSBuild, esmBuild, browserBuilds];
};
