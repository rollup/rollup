const assert = require('assert');

module.exports = {
	description: 'Associates function return values of returned functions',
	exports(exports) {
		assert.equal(exports.bar, 'present');
	}
};
