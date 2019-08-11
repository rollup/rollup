const assert = require('assert');

module.exports = {
	description: 'should delete use asm from function body if it is not the first expression',
	code(code) {
		assert.equal(code.indexOf('use asm'), -1);
	}
};
