const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'should delete use asm from function body if it is not the first expression',
	code(code) {
		assert.ok(!code.includes('use asm'));
	}
});
