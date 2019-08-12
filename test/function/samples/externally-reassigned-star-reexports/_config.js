const assert = require('assert');

module.exports = {
	description: 'calls to externally reassigned methods of namespace reexports must be retained',
	exports(exports) {
		let triggered = false;
		exports.obj.reassigned = function() {
			triggered = true;
		};
		exports.test();
		assert.ok(triggered);
	}
};
