const assert = require('assert');

module.exports = {
	description: 'remove unused variables from declarations (#1831)',
	code(code) {
		assert.ok(code.search(/var a = 'test'/) >= 0);
	}
};
