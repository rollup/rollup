const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'sorts statements according to their original order within modules, part 2',
	exports(exports) {
		assert.equal(exports.answer, 42);
	}
});
