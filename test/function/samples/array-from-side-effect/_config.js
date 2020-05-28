const assert = require('assert');

module.exports = {
	description: 'Observes side-effects in Array.from',
	exports(exports) {
		assert.strictEqual(exports.x, 7);
	}
};
