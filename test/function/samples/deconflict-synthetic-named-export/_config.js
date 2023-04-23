const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'deconflicts synthetic named exports',
	options: {
		plugins: [
			{
				transform(code) {
					return { code, syntheticNamedExports: 'foo' };
				}
			}
		]
	},
	exports(exports) {
		assert.strictEqual(exports(2), 4);
	}
});
