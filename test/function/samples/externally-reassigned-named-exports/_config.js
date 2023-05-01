const assert = require('node:assert');

module.exports = defineTest({
	description: 'calls to externally reassigned methods of named exports must be retained',
	exports(exports) {
		let triggered1 = false;

		let triggered2 = false;
		exports.obj1.reassigned = function () {
			triggered1 = true;
		};
		exports.obj2.reassigned = function () {
			triggered2 = true;
		};
		exports.test();
		assert.ok(triggered1);
		assert.ok(triggered2);
	}
});
