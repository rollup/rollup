const assert = require('assert');

module.exports = {
	description: 'Associates value mutations across return values',
	exports(exports) {
		assert.equal(exports.bar, 'present');
	}
};
