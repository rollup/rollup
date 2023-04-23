const assert = require('node:assert');

module.exports = defineTest({
	description: 'should delete use strict from function body',
	code(code) {
		assert.equal(code.lastIndexOf('use strict'), 1);
	}
});
