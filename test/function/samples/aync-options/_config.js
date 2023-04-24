const assert = require('node:assert');

module.exports = defineTest({
	description: 'handles async plugin options',
	options: {
		preserveEntrySignatures: false,
		plugins: [
			{
				name: 'test-plugin1',
				options(options) {
					assert.strictEqual(options.preserveEntrySignatures, false);
					return Promise.resolve({ ...options, preserveEntrySignatures: 'strict' });
				}
			},
			{
				name: 'test-plugin2',
				options(options) {
					assert.strictEqual(options.preserveEntrySignatures, 'strict');
					return Promise.resolve(null);
				}
			}
		]
	},
	exports(exports) {
		assert.strictEqual(exports.foo, 1);
	}
});
