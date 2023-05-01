const assert = require('node:assert');

module.exports = defineTest({
	description: 'remove unused variables from declarations (#1831)',
	code(code) {
		assert.ok(code.search(/var a = 'test'/) >= 0);
	}
});
