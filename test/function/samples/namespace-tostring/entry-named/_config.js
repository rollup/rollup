const assert = require('assert');

// TODO Lukas also validate for other formats
// TODO Lukas also handle dynamic imports
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
