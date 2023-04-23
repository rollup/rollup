const assert = require('node:assert');

module.exports = defineTest({
	description: 'function arguments are renamed as appropriate (#32)',
	exports(exports) {
		const object = {};
		assert.strictEqual(exports.foo(), 42);
		assert.strictEqual(exports.bar(object), object);
	}
});
