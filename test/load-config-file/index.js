const loadConfigFile = require('../../dist/loadConfigFile.js');
const assert = require('assert');
const path = require('path');

describe('loadConfigFile', () => {
	it('loads a config file', async () => {
		const { options, warnings } = await loadConfigFile(
			path.resolve(__dirname, 'samples/basic/rollup.config.js')
		);
		assert.strictEqual(warnings.count, 0);
		assert.deepStrictEqual(JSON.parse(JSON.stringify(options)), [
			{
				experimentalCacheExpiry: 10,
				external: [],
				inlineDynamicImports: false,
				input: 'my-input',
				output: [
					{
						amd: {},
						compact: false,
						esModule: true,
						externalLiveBindings: true,
						file: 'my-file',
						format: 'es',
						freeze: true,
						hoistTransitiveImports: true,
						indent: true,
						interop: true,
						namespaceToStringTag: false,
						plugins: [],
						strict: true,
					},
				],
				perf: false,
				plugins: [
					{
						name: 'stdin',
					},
				],
				strictDeprecations: false,
			},
		]);
	});
});
