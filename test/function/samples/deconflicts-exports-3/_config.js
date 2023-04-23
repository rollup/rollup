const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'renames variables named "module" if necessary',
	exports(exports) {
		assert.equal(exports, 1);
	}
});
