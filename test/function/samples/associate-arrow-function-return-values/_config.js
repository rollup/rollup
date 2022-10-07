const assert = require('node:assert');

module.exports = {
	description: 'Associates function return values with regard to mutations',
	exports(exports) {
		assert.equal(exports.bar, 'present');
	}
};
