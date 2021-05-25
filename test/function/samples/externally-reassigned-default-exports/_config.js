const assert = require('assert');

module.exports = {
	description: 'calls to externally reassigned methods of default exports must be retained',
	exports(exports) {
		let triggered = false;
		exports.reassigned = function () {
			triggered = true;
		};
		exports.test();
		assert.ok(triggered);
	}
};
