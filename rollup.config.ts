import { resolve } from 'path';
import { fileURLToPath } from 'url';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import type { Plugin, RollupOptions, WarningHandlerWithDefault } from 'rollup';
import { string } from 'rollup-plugin-string';
import { terser } from 'rollup-plugin-terser';
import addCliEntry from './build-plugins/add-cli-entry';
import cleanBeforeWrite from './build-plugins/clean-before-write';
import conditionalFsEventsImport from './build-plugins/conditional-fsevents-import';
import copyTypes from './build-plugins/copy-types';
import emitModulePackageFile from './build-plugins/emit-module-package-file';
import esmDynamicImport from './build-plugins/esm-dynamic-import';
import getLicenseHandler from './build-plugins/generate-license-file';
import getBanner from './build-plugins/get-banner';
import replaceBrowserModules from './build-plugins/replace-browser-modules';

const onwarn: WarningHandlerWithDefault = warning => {
	// eslint-disable-next-line no-console
	console.error(
		'Building Rollup produced warnings that need to be resolved. ' +
			'Please keep in mind that the browser build may never have external dependencies!'
	);
	throw Object.assign(new Error(), warning);
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

const nodePlugins: Plugin[] = [
	alias(moduleAliases),
	nodeResolve(),
	json(),
	conditionalFsEventsImport(),
	string({ include: '**/*.md' }),
	commonjs({
		ignoreTryCatch: false,
		include: 'node_modules/**'
	}),
	typescript(),
	cleanBeforeWrite('dist')
];

export default async function (
	command: Record<string, unknown>
): Promise<RollupOptions | RollupOptions[]> {
	const { collectLicenses, writeLicense } = getLicenseHandler(
		fileURLToPath(new URL('.', import.meta.url))
	);

	const commonJSBuild: RollupOptions = {
		// 'fsevents' is a dependency of 'chokidar' that cannot be bundled as it contains binary code
		external: ['fsevents'],
		input: {
			'loadConfigFile.js': 'cli/run/loadConfigFile.ts',
			'rollup.js': 'src/node-entry.ts'
		},
		onwarn,
		output: {
			banner: getBanner,
			chunkFileNames: 'shared/[name].js',
			dir: 'dist',
			entryFileNames: '[name]',
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
			!command.configTest && collectLicenses(),
			!command.configTest && copyTypes('rollup.d.ts')
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
		plugins: [...nodePlugins, emitModulePackageFile(), collectLicenses(), writeLicense()]
	};

	const { collectLicenses: collectLicensesBrowser, writeLicense: writeLicenseBrowser } =
		getLicenseHandler(fileURLToPath(new URL('browser', import.meta.url)));

	const browserBuilds: RollupOptions = {
		input: 'src/browser-entry.ts',
		onwarn,
		output: [
			{
				banner: getBanner,
				file: 'browser/dist/rollup.browser.js',
				format: 'umd',
				name: 'rollup',
				plugins: [copyTypes('rollup.browser.d.ts')],
				sourcemap: true
			},
			{
				banner: getBanner,
				file: 'browser/dist/es/rollup.browser.js',
				format: 'es',
				plugins: [emitModulePackageFile()]
			}
		],
		plugins: [
			replaceBrowserModules(),
			alias(moduleAliases),
			nodeResolve({ browser: true }),
			json(),
			commonjs(),
			typescript(),
			terser({ module: true, output: { comments: 'some' } }),
			collectLicensesBrowser(),
			writeLicenseBrowser(),
			cleanBeforeWrite('browser/dist')
		],
		strictDeprecations: true,
		treeshake
	};

	return [commonJSBuild, esmBuild, browserBuilds];
}
