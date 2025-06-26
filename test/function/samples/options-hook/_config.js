const assert = require('node:assert');

module.exports = defineTest({
	description: 'allows to read and modify options in the options hook',
	verifyAst: false,
	options: {
		input: 'unused',
		treeshake: false,
		plugins: [
			{
				name: 'test-plugin',
				buildStart(options) {
					// The fs option is not json stringifiable
					const { fs, ...restOptions } = options;
					assert.ok(fs);
					assert.deepStrictEqual(JSON.parse(JSON.stringify(restOptions)), {
						context: 'undefined',
						experimentalCacheExpiry: 10,
						experimentalLogSideEffects: false,
						input: ['used'],
						jsx: false,
						logLevel: 'info',
						makeAbsoluteExternalsRelative: 'ifRelativeSource',
						maxParallelFileOps: 1000,
						perf: false,
						plugins: [
							{
								name: 'test-plugin'
							}
						],
						preserveEntrySignatures: 'exports-only',
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
						plugins: [{ name: 'test-plugin' }],
						strictDeprecations: true,
						treeshake: false
					});
					assert.ok(/^\d+\.\d+\.\d+/.test(this.meta.rollupVersion));
					assert.strictEqual(this.meta.watchMode, false);
					return { ...options, input: 'used' };
				}
			}
		]
	}
});
