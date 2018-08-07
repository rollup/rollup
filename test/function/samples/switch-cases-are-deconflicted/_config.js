const assert = require('assert');

module.exports = {
	description: 'deconflicts variables in switch cases (#1970)',
	exports(exports) {
		assert.equal(exports.fn1('1'), 'correct');
		assert.equal(exports.fn2('2'), 'correct');
	}
};
