const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'Associates getter return values with regard to calls',
	exports(exports) {
		assert.equal(exports.bar, 'present');
	}
});
