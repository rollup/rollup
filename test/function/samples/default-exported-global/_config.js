const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'Tracks updates of default exported globals',
	exports(exports) {
		assert.deepStrictEqual(exports, { original: 1, updated: 2 });
	}
});
