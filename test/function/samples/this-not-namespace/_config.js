const assert = require('node:assert');

module.exports = defineTest({
	description: 'does not treat this.foo as a possible namespace (#1258)',
	exports: exports => {
		assert.equal(typeof exports.Foo, 'function');
	}
});
