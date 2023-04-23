const assert = require('node:assert');

module.exports = defineRollupTest({
	description: "shouldn't delete use asm from the start of a function body",
	code(code) {
		assert.notEqual(code.indexOf('use asm'), -1);
	}
});
