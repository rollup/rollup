const assert = require('assert');

module.exports = {
	description: 'function arguments are renamed as appropriate (#32)',
	exports(exports) {
		const obj = {};
		assert.strictEqual(exports.foo(), 42);
		assert.strictEqual(exports.bar(obj), obj);
	}
};
