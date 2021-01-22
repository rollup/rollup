const assert = require('assert');

module.exports = {
	description: 'handles hoisted variables in chained if statements',
	exports(exports) {
		exports.test(true);
		assert.strictEqual(exports.result, 'first');
		exports.test(false);
		assert.strictEqual(exports.result, 'third');
		exports.test('loop');
		assert.strictEqual(exports.result, 'fourth');
	}
};
