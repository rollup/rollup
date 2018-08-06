const assert = require('assert');

module.exports = {
	description: 'should delete use strict from function body',
	code(code) {
		assert.equal(code.lastIndexOf('use strict'), 1);
	}
};
