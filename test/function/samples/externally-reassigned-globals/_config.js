const assert = require('node:assert');

module.exports = defineTest({
	description: 'calls to externally reassigned global methods must be retained',
	exports(exports) {
		let triggered1 = false;

		let triggered2 = false;
		global.obj1.reassigned = function () {
			triggered1 = true;
		};
		global.obj2.reassigned = function () {
			triggered2 = true;
		};

		exports.test();
		delete global.obj1;
		delete global.obj2;

		assert.ok(triggered1);
		assert.ok(triggered2);
	}
});
