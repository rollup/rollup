const assert = require('node:assert');

module.exports = defineTest({
	description: 'prevent semicolon insertion for return statements when there are line comments',
	exports(exports) {
		assert.strictEqual(exports(), 1);
	}
});
