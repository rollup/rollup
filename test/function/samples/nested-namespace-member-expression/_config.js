const assert = require('node:assert');

module.exports = defineTest({
	description: 'handles accessing members of namespaces correctly',
	exports(exports) {
		assert.strictEqual(exports, false);
	}
});
