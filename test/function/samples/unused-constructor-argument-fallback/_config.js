const assert = require('node:assert');

module.exports = defineTest({
	description: 'handles unused logical expressions as constructor arguments (#4517)',
	exports({ create }) {
		assert.strictEqual(create().foo, 'foo');
	}
});
