const assert = require('assert');

module.exports = {
	description: 'detect side effect in member expression assignment when not top level',
	code(code) {
		assert.equal(code.indexOf('function set(key, value) { foo[key] = value; }') >= 0, true, code);
		assert.equal(code.indexOf('set("bar", 2);') >= 0, true, code);
		assert.equal(code.indexOf('set("qux", 3);') >= 0, true, code);
	}
};
