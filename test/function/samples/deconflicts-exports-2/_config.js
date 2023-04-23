const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'renames nested variables named "exports" if necessary',
	exports(exports) {
		assert.equal(exports.x, 2);
	}
});
