const assert = require('node:assert');

module.exports = {
	description: 'correctly exports deconflicted names',
	exports(exports) {
		assert.equal(exports.bar(), 'bar');
	}
};
