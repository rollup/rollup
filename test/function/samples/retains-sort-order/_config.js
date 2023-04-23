const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'sorts statements according to their original order within modules',
	exports(exports) {
		assert.equal(exports, 'GREAT SUCCESS');
	}
});
