const assert = require('node:assert');

module.exports = defineTest({
	description: 'does not expose the synthetic namespace if an entry point uses a string value',
	options: {
		plugins: [
			{
				transform(code) {
					return { code, syntheticNamedExports: '__synthetic' };
				}
			}
		]
	},
	exports(exports) {
		assert.deepStrictEqual(exports, {
			exists: 'exists'
		});
	}
});
