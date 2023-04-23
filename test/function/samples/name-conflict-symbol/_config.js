const assert = require('node:assert');

module.exports = defineTest({
	description: 'avoids name conflicts with local variables named Symbol',
	options: {
		output: {
			generatedCode: { symbols: true }
		}
	},
	exports(exports) {
		assert.strictEqual(exports.Symbol, null);
		assert.strictEqual(exports.toString(), '[object Module]');
	}
});
