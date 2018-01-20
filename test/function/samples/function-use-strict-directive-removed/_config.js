var assert = require('assert');

module.exports = {
	description: 'should delete use strict from function body',
	code: function(code) {
		assert.equal(code.lastIndexOf('use strict'), 1);
	},
	show: true
};
