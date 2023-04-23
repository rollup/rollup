const assert = require('node:assert');

module.exports = defineTest({
	description: 'external namespace reexport',
	options: {
		external: ['external'],
		output: {
			generatedCode: { symbols: true }
		}
	},
	exports(exports) {
		assert.strictEqual(typeof exports.maths, 'object');
		assert.strictEqual(exports[Symbol.toStringTag], 'Module');
		assert.strictEqual(exports.maths.external, true);
	}
});
