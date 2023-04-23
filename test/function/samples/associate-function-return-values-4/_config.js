const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'Handles empty return statements (#1702)',
	exports(exports) {
		assert.equal(exports.bar, 'present');
	}
});
