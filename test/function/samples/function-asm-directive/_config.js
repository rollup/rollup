const assert = require('assert');

module.exports = {
	description: "shouldn't delete use asm from the start of a function body",
	code(code) {
		assert.notEqual(code.indexOf('use asm'), -1);
	}
};
