const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'handles default exports before a variable is declared',
	exports(exports) {
		assert.strictEqual(exports, undefined);
	}
});
