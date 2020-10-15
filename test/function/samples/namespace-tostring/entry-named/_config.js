const assert = require('assert');

module.exports = {
	description: 'adds Symbol.toStringTag property to entry chunks with named exports',
	options: {
		output: {
			namespaceToStringTag: true,
			exports: 'named'
		}
	},
	exports(exports) {
		assert.strictEqual(exports[Symbol.toStringTag], 'Module');
		assert.strictEqual(Object.prototype.toString.call(exports), '[object Module]');
		assert.strictEqual(exports.foo, 42);
	}
};
