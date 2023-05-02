import process from 'node:process';
import { fileURLToPath } from 'node:url';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import type { Plugin, RollupOptions, WarningHandlerWithDefault } from 'rollup';
import { string } from 'rollup-plugin-string';
import addCliEntry from './build-plugins/add-cli-entry';
import { moduleAliases } from './build-plugins/aliases';
import cleanBeforeWrite from './build-plugins/clean-before-write';
import { copyBrowserTypes, copyNodeTypes } from './build-plugins/copy-types';
import emitModulePackageFile from './build-plugins/emit-module-package-file';
import esmDynamicImport from './build-plugins/esm-dynamic-import';
import { fsEventsReplacement } from './build-plugins/fs-events-replacement';
import getLicenseHandler from './build-plugins/generate-license-file';
import getBanner from './build-plugins/get-banner';
import replaceBrowserModules from './build-plugins/replace-browser-modules';

const onwarn: WarningHandlerWithDefault = warning => {
	// eslint-disable-next-line no-console
	console.error(
		'Building Rollup produced warnings that need to be resolved. ' +
			'Please keep in mind that the browser build may never have external dependencies!'
	);
	// eslint-disable-next-line unicorn/error-message
	throw Object.assign(new Error(), warning);
};

const treeshake = {
	moduleSideEffects: false,
	propertyReadSideEffects: false,
	tryCatchDeoptimization: false
};

const nodePlugins: readonly Plugin[] = [
	replace(fsEventsReplacement),
	alias(moduleAliases),
	nodeResolve(),
	json(),
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
			exports: 'named',
			externalLiveBindings: false,
			format: 'cjs',
			freeze: false,
			generatedCode: 'es2015',
			interop: 'default',
			sourcemap: true
		},
		plugins: [
			...nodePlugins,
			addCliEntry(),
			esmDynamicImport(),
			!command.configTest && collectLicenses(),
			!command.configTest && copyNodeTypes()
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
				plugins: [copyBrowserTypes()],
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
			cleanBeforeWrite('browser/dist'),
			{
				// TODO remove after next Rollup dependency update
				closeBundle() {
					// On CI, macOS runs sometimes do not close properly. This is a hack
					// to fix this until the problem is understood.
					console.log('Force quit.');
					setTimeout(() => process.exit(0));
				},
				name: 'force-close'
			}
		],
		strictDeprecations: true,
		treeshake
	};

	return [commonJSBuild, esmBuild, browserBuilds];
}
