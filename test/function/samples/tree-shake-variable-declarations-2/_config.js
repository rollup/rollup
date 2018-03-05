var assert = require('assert');

module.exports = {
	description: 'remove unused variables from declarations (#1831)',
	code: function(code) {
		assert.ok(code.search(/var a = 'test'/) >= 0);
	}
};
