const assert = require('node:assert');

module.exports = defineTest({
	description: 'renames variables named "module" if necessary',
	exports(exports) {
		assert.equal(exports, 1);
	}
});
