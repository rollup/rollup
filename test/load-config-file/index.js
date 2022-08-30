const assert = require('node:assert');
const path = require('node:path');
const { loadConfigFile } = require('../../dist/loadConfigFile.js');
const { compareError } = require('../utils');

describe('loadConfigFile', () => {
	const defaultConfigs = [
		{
			external: [],
			input: 'my-input',
			output: [
				{
					file: 'my-file',
					format: 'es',
					plugins: []
				}
			],
			plugins: [
				{
					name: 'stdin'
				}
			]
		}
	];

	it('loads an ESM config file', async () => {
		const { options, warnings } = await loadConfigFile(
			path.resolve(__dirname, 'samples/esm-via-pkg/rollup.config.js')
		);
		assert.strictEqual(warnings.count, 0);
		// Remove undefined values and functions before checking
		assert.deepStrictEqual(JSON.parse(JSON.stringify(options)), defaultConfigs);
	});

	it('loads an ESM config file with mjs extension', async () => {
		const { options, warnings } = await loadConfigFile(
			path.resolve(__dirname, 'samples/esm-via-ext/rollup.config.mjs')
		);
		assert.strictEqual(warnings.count, 0);
		// Remove undefined values and functions before checking
		assert.deepStrictEqual(JSON.parse(JSON.stringify(options)), defaultConfigs);
	});

	it('loads a CommonJS config file', async () => {
		const { options, warnings } = await loadConfigFile(
			path.resolve(__dirname, 'samples/cjs-via-pkg/rollup.config.js')
		);
		assert.strictEqual(warnings.count, 0);
		// Remove undefined values and functions before checking
		assert.deepStrictEqual(JSON.parse(JSON.stringify(options)), defaultConfigs);
	});

	it('loads a CommonJS config file with cjs extension', async () => {
		const { options, warnings } = await loadConfigFile(
			path.resolve(__dirname, 'samples/cjs-via-ext/rollup.config.cjs')
		);
		assert.strictEqual(warnings.count, 0);
		// Remove undefined values and functions before checking
		assert.deepStrictEqual(JSON.parse(JSON.stringify(options)), defaultConfigs);
	});

	it('throws a helpful error when loading an ES module that should actually be CommonJS', async () => {
		let caughtError;
		try {
			await loadConfigFile(path.resolve(__dirname, 'samples/cjs-as-esm/rollup.config.js'));
		} catch (err) {
			caughtError = err;
		}
		compareError(caughtError, {
			cause: {
				message: "Unexpected token 'export'"
			},
			code: 'INVALID_CONFIG_MODULE_FORMAT',
			message:
				'Node tried to load your configuration file as CommonJS even though it is likely an ES module. To resolve this, change the extension of your configuration to ".mjs", set "type": "module" in your package.json file or pass the "--bundleConfigAsCjs" flag.\n\nOriginal error: Unexpected token \'export\'',
			url: 'https://rollupjs.org/guide/en/#--bundleconfigascjs'
		});
	});

	it('just throws the error if it is not accompanied by the proper warning', async () => {
		let caughtError;
		try {
			const promise = loadConfigFile(
				path.resolve(__dirname, 'samples/esm-with-error/rollup.config.js')
			);
			process.emit('warning', { message: 'Another warning.' });
			await promise;
		} catch (err) {
			caughtError = err;
		}
		compareError(caughtError, {
			message: 'Config broken.'
		});
	});

	it('throws a helpful error when loading a CommonJS module that should actually be ES', async () => {
		let caughtError;
		try {
			await loadConfigFile(path.resolve(__dirname, 'samples/esm-as-cjs/rollup.config.js'));
		} catch (err) {
			caughtError = err;
		}
		assert.strictEqual(
			caughtError.message.slice(0, 256),
			'Node tried to load your configuration as an ES module even though it is likely CommonJS. To resolve this, change the extension of your configuration to ".cjs" or pass the "--bundleConfigAsCjs" flag.\n\nOriginal error: module is not defined in ES module scope'
		);
	});

	it('throws a helpful error when loading a CJS module that should actually be ESM while bundling', async () => {
		let caughtError;
		try {
			await loadConfigFile(path.resolve(__dirname, 'samples/esm-as-cjs/rollup.config.js'), {
				configPlugin: '{transform: c => c}'
			});
		} catch (err) {
			caughtError = err;
		}
		compareError(caughtError, {
			cause: {
				message: 'module is not defined in ES module scope'
			},
			code: 'INVALID_CONFIG_MODULE_FORMAT',
			message:
				'Rollup transpiled your configuration to an  ES module even though it appears to contain CommonJS elements. To resolve this, you can pass the "--bundleConfigAsCjs" flag to Rollup or change your configuration to only contain valid ESM code.\n\nOriginal error: module is not defined in ES module scope',
			url: 'https://rollupjs.org/guide/en/#--bundleconfigascjs'
		});
	});

	it('just throws other errors while bundling', async () => {
		let caughtError;
		try {
			await loadConfigFile(path.resolve(__dirname, 'samples/esm-with-error/rollup.config.js'), {
				configPlugin: '{transform: c => c}'
			});
		} catch (err) {
			caughtError = err;
		}
		compareError(caughtError, {
			message: 'Config broken.'
		});
	});
});
