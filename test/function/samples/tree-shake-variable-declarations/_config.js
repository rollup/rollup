const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'remove unused variables from declarations (#1937)',
	exports(exports) {
		assert.deepEqual(exports(), [0.07]);
	}
});
