const assert = require('assert');

module.exports = {
	description: 'prevent automatic semicolon insertion from changing behaviour when tree-shaking',
	exports(exports) {
		assert.strictEqual(exports.test1(), 'expected');
		assert.strictEqual(exports.test2(), 'expected');
	}
};
