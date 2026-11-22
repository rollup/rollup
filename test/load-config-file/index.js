const assert = require('node:assert');
const path = require('node:path');
const { loadConfigFile } = require('../../dist/loadConfigFile.js');
const { compareError, hasEsBuild } = require('../testHelpers');

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

	if (hasEsBuild) {
		it('loads an ESM config file exporting a config as a function with defineConfig()', async () => {
			const { options, warnings } = await loadConfigFile(
				path.resolve(__dirname, 'samples/esm-defineconfig-as-fn/rollup.config.mjs')
			);
			assert.strictEqual(warnings.count, 0);
			// Remove undefined values and functions before checking
			assert.deepStrictEqual(JSON.parse(JSON.stringify(options)), defaultConfigs);
		});
	}

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

	it('loads a CommonJS config file exporting a config as a function with defineConfig()', async () => {
		const { options, warnings } = await loadConfigFile(
			path.resolve(__dirname, 'samples/cjs-defineconfig-as-fn/rollup.config.cjs')
		);
		assert.strictEqual(warnings.count, 0);
		// Remove undefined values and functions before checking
		assert.deepStrictEqual(JSON.parse(JSON.stringify(options)), defaultConfigs);
	});

	it('applies environment options before evaluating an ESM config', async () => {
		const previousInput = process.env.ROLLUP_TEST_CONFIG_INPUT;
		delete process.env.ROLLUP_TEST_CONFIG_INPUT;
		try {
			const { options } = await loadConfigFile(
				path.resolve(__dirname, 'samples/environment/rollup.config.mjs'),
				{ environment: 'ROLLUP_TEST_CONFIG_INPUT:myfile' }
			);
			assert.strictEqual(options[0].input, 'myfile');
			assert.strictEqual(process.env.ROLLUP_TEST_CONFIG_INPUT, 'myfile');
		} finally {
			if (previousInput === undefined) {
				delete process.env.ROLLUP_TEST_CONFIG_INPUT;
			} else {
				process.env.ROLLUP_TEST_CONFIG_INPUT = previousInput;
			}
		}
	});

	it('applies environment options before evaluating a CommonJS config', async () => {
		const keys = [
			'ROLLUP_TEST_CONFIG_INPUT',
			'ROLLUP_TEST_CONFIG_FLAG',
			'ROLLUP_TEST_CONFIG_EMPTY',
			'ROLLUP_TEST_CONFIG_HOST'
		];
		const previousValues = keys.map(key => process.env[key]);
		process.env.ROLLUP_TEST_CONFIG_INPUT = 'previous-input';
		process.env.ROLLUP_TEST_CONFIG_EMPTY = 'previous-value';
		try {
			const configFile = path.resolve(__dirname, 'samples/environment/rollup.config.cjs');
			const { options } = await loadConfigFile(configFile, {
				environment: [
					'ROLLUP_TEST_CONFIG_INPUT:first,ROLLUP_TEST_CONFIG_FLAG,ROLLUP_TEST_CONFIG_EMPTY:',
					'ROLLUP_TEST_CONFIG_HOST:http://localhost:4000,ROLLUP_TEST_CONFIG_INPUT:myfile'
				]
			});
			assert.deepStrictEqual(options[0].input, ['myfile', 'true', '', 'http://localhost:4000']);
			assert.deepStrictEqual(
				keys.map(key => process.env[key]),
				options[0].input
			);

			const environment = { ...process.env };
			await loadConfigFile(configFile);
			assert.deepStrictEqual({ ...process.env }, environment);
		} finally {
			for (const [index, key] of keys.entries()) {
				const previousValue = previousValues[index];
				if (previousValue === undefined) {
					delete process.env[key];
				} else {
					process.env[key] = previousValue;
				}
			}
		}
	});

	it('throws a helpful error when loading an ES module that should actually be CommonJS', async () => {
		let caughtError;
		try {
			await loadConfigFile(path.resolve(__dirname, 'samples/cjs-as-esm/rollup.config.js'));
		} catch (error) {
			caughtError = error;
		}
		compareError(caughtError, {
			cause: {
				message: "Unexpected token 'export'"
			},
			code: 'INVALID_CONFIG_MODULE_FORMAT',
			message:
				'Node tried to load your configuration file as CommonJS even though it is likely an ES module. To resolve this, change the extension of your configuration to ".mjs", set "type": "module" in your package.json file or pass the "--bundleConfigAsCjs" flag.\n\nOriginal error: Unexpected token \'export\'',
			url: 'https://rollupjs.org/command-line-interface/#bundleconfigascjs'
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
		} catch (error) {
			caughtError = error;
		}
		compareError(caughtError, {
			message: 'Config broken.'
		});
	});

	it('throws a helpful error when loading a CommonJS module that should actually be ES', async () => {
		let caughtError;
		try {
			await loadConfigFile(path.resolve(__dirname, 'samples/esm-as-cjs/rollup.config.js'));
		} catch (error) {
			caughtError = error;
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
		} catch (error) {
			caughtError = error;
		}
		compareError(caughtError, {
			cause: {
				message: 'module is not defined in ES module scope'
			},
			code: 'INVALID_CONFIG_MODULE_FORMAT',
			message:
				'Rollup transpiled your configuration to an  ES module even though it appears to contain CommonJS elements. To resolve this, you can pass the "--bundleConfigAsCjs" flag to Rollup or change your configuration to only contain valid ESM code.\n\nOriginal error: module is not defined in ES module scope',
			url: 'https://rollupjs.org/command-line-interface/#bundleconfigascjs'
		});
	});

	it('just throws other errors while bundling', async () => {
		let caughtError;
		try {
			await loadConfigFile(path.resolve(__dirname, 'samples/esm-with-error/rollup.config.js'), {
				configPlugin: '{transform: c => c}'
			});
		} catch (error) {
			caughtError = error;
		}
		compareError(caughtError, {
			message: 'Config broken.'
		});
	});
});
