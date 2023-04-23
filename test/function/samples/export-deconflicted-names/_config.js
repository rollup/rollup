const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'correctly exports deconflicted names',
	exports(exports) {
		assert.equal(exports.bar(), 'bar');
	}
});
