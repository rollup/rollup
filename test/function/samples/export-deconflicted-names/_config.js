const assert = require('node:assert');

module.exports = defineTest({
	description: 'correctly exports deconflicted names',
	exports(exports) {
		assert.equal(exports.bar(), 'bar');
	}
});
