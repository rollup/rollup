const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'exports a default value as module.exports',
	exports(exports) {
		assert.equal(exports, 42);
	}
});
