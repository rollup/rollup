const assert = require('node:assert');

module.exports = defineTest({
	description: 'Observes side-effects in Array.from',
	exports(exports) {
		assert.strictEqual(exports.x, 7);
	}
});
