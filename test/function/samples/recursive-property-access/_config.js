const assert = require('assert');

module.exports = defineTest({
	description: 'handles accessing different properties in recursive calls with good performance',
	exports(exports) {
		assert.strictEqual(exports.test({ u: { s: { w: 42 } } }), 42);
	}
});
