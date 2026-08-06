const assert = require('node:assert');

module.exports = defineTest({
	description:
		'adds the missing semicolon after a default export when the exported expression is replaced while rendering',
	options: {
		output: { compact: true }
	},
	exports(exports) {
		assert.strictEqual(exports, 'number');
	}
});
