const assert = require('assert');

module.exports = {
	description: 'handles default exports before a variable is declared',
	exports(exports) {
		assert.strictEqual(exports, undefined);
	}
};
