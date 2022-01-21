import { readFileSync } from 'fs';
import { resolve } from 'path';
import process from 'process';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import type { RollupOptions, WarningHandlerWithDefault } from 'rollup';
import { string } from 'rollup-plugin-string';
import { terser } from 'rollup-plugin-terser';
import addCliEntry from './build-plugins/add-cli-entry';
import conditionalFsEventsImport from './build-plugins/conditional-fsevents-import';
import emitModulePackageFile from './build-plugins/emit-module-package-file';
import esmDynamicImport from './build-plugins/esm-dynamic-import';
import getLicenseHandler from './build-plugins/generate-license-file';
import replaceBrowserModules from './build-plugins/replace-browser-modules';
import { version } from './package.json';

const commitHash = (function () {
	try {
		return readFileSync('.commithash', 'utf-8');
	} catch {
		return 'unknown';
	}
})();

const { SOURCE_DATE_EPOCH } = process.env;
const now = new Date(SOURCE_DATE_EPOCH ? 1000 * +SOURCE_DATE_EPOCH : Date.now()).toUTCString();

const banner = `/*
  @license
	Rollup.js v${version}
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
	entries: {
		acorn: resolve('node_modules/acorn/dist/acorn.mjs'),
		'help.md': resolve('cli/help.md'),
		'package.json': resolve('package.json')
	},
	resolve: ['.js', '.json', '.md']
};

const treeshake = {
	moduleSideEffects: false,
	propertyReadSideEffects: false,
	tryCatchDeoptimization: false
};

const nodePlugins = [
	alias(moduleAliases),
	nodeResolve(),
	json(),
	conditionalFsEventsImport(),
	string({ include: '**/*.md' }),
	commonjs({
		ignoreTryCatch: false,
		include: 'node_modules/**'
	}),
	typescript()
];

export default (command: Record<string, unknown>): RollupOptions | RollupOptions[] => {
	const { collectLicenses, writeLicense } = getLicenseHandler();
	const commonJSBuild: RollupOptions = {
		// 'fsevents' is a dependency of 'chokidar' that cannot be bundled as it contains binary code
		external: ['fsevents'],
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
			interop: 'default',
			manualChunks: { rollup: ['src/node-entry.ts'] },
			sourcemap: true
		},
		plugins: [
			...nodePlugins,
			addCliEntry(),
			esmDynamicImport(),
			!command.configTest && collectLicenses()
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
			nodeResolve({ browser: true }),
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
