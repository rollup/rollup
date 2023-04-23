const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'exports are kept up-to-date',
	exports(exports) {
		assert.equal(exports.count, 0);
		exports.incr();
		assert.equal(exports.count, 1);
	}
});
