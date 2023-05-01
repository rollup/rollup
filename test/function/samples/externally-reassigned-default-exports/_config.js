const assert = require('node:assert');

module.exports = defineTest({
	description: 'calls to externally reassigned methods of default exports must be retained',
	exports(exports) {
		let triggered = false;
		exports.reassigned = function () {
			triggered = true;
		};
		exports.test();
		assert.ok(triggered);
	}
});
