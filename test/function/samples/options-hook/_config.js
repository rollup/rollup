const assert = require('assert');

module.exports = {
	description: 'allows to read and modify options in the options hook',
	options: {
		input: 'unused',
		treeshake: false,
		plugins: {
			name: 'test-plugin',
			buildStart(options) {
				assert.deepStrictEqual(JSON.parse(JSON.stringify(options)), {
					acorn: {
						allowAwaitOutsideFunction: true,
						ecmaVersion: 'latest',
						preserveParens: false,
						sourceType: 'module'
					},
					acornInjectPlugins: [null, null, null],
					context: 'undefined',
					experimentalCacheExpiry: 10,
					input: ['used'],
					makeAbsoluteExternalsRelative: true,
					perf: false,
					plugins: [
						{
							name: 'test-plugin'
						}
					],
					preserveEntrySignatures: 'strict',
					preserveSymlinks: false,
					shimMissingExports: false,
					strictDeprecations: true,
					treeshake: false
				});
				assert.ok(/^\d+\.\d+\.\d+/.test(this.meta.rollupVersion));
				assert.strictEqual(this.meta.watchMode, false);
			},
			options(options) {
				assert.deepStrictEqual(JSON.parse(JSON.stringify(options)), {
					input: 'unused',
					plugins: {
						name: 'test-plugin'
					},
					strictDeprecations: true,
					treeshake: false
				});
				assert.ok(/^\d+\.\d+\.\d+/.test(this.meta.rollupVersion));
				assert.strictEqual(this.meta.watchMode, false);
				return Object.assign({}, options, { input: 'used' });
			}
		}
	}
};
