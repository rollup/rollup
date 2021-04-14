const assert = require('assert');

module.exports = {
	description: 'handles async plugin options',
	options: {
		preserveEntrySignatures: false,
		plugins: [
			{
				options(options) {
					assert.strictEqual(options.preserveEntrySignatures, false);
					return Promise.resolve({ ...options, preserveEntrySignatures: 'strict' });
				}
			},
			{
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
};
