const assert = require('assert');

module.exports = defineTest({
	description: 'Make tree-shaking work on the handler of the Proxy',
	code(code) {
		assert.ok(!code.includes('assert.ok(false)'));
	}
});
