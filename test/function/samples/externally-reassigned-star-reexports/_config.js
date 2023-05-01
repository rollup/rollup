const assert = require('node:assert');

module.exports = defineTest({
	description: 'calls to externally reassigned methods of namespace reexports must be retained',
	exports(exports) {
		let triggered = false;
		exports.obj.reassigned = function () {
			triggered = true;
		};
		exports.test();
		assert.ok(triggered);
	}
});
