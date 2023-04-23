const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'does not wrongly append comments',
	exports(exports) {
		assert.equal(exports, 42);
	}
});
