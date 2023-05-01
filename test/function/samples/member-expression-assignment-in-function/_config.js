const assert = require('node:assert');

module.exports = defineTest({
	description: 'detect side effect in member expression assignment when not top level',
	code(code) {
		assert.ok(code.includes('function set(key, value) { foo[key] = value; }'), code);
		assert.ok(code.includes('set("bar", 2);'), code);
		assert.ok(code.includes('set("qux", 3);'), code);
	}
});
