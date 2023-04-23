const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'exports a default named function',
	exports(exports) {
		assert.equal(exports(), 42);
	}
});
