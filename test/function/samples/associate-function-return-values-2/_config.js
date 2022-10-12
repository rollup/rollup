const assert = require('node:assert');

module.exports = {
	description: 'Associates function return values with regard to calls',
	exports(exports) {
		assert.equal(exports.bar, 'present');
	}
};
