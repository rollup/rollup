const assert = require('node:assert');

module.exports = defineTest({
	description: 'exports a default named function',
	exports(exports) {
		assert.equal(exports(), 42);
	}
});
