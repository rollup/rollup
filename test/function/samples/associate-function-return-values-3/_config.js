const assert = require('node:assert');

module.exports = defineTest({
	description: 'Associates function return values of returned functions',
	exports(exports) {
		assert.equal(exports.bar, 'present');
	}
});
