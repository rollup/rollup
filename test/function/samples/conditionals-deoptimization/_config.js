const assert = require('assert');

module.exports = {
	description: 'handles deoptimization of conditionals',
	exports(exports) {
		assert.deepStrictEqual(exports, { first: true, second: true, third: true, fourth: true });
	}
};
