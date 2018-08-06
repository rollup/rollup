const assert = require('assert');

module.exports = {
	description: 'exports named values from the bundle entry module',
	exports(exports) {
		assert.equal(exports.answer, 42);
	}
};
