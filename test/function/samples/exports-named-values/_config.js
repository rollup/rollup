const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'exports named values from the bundle entry module',
	exports(exports) {
		assert.equal(exports.answer, 42);
	}
});
