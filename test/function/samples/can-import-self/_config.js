const assert = require('assert');

module.exports = {
	description: 'a module importing its own bindings',
	exports(exports) {
		assert.equal(exports.result, 4);
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['lib.js', 'lib.js'],
			importer: 'lib.js',
			message: 'Circular dependency: lib.js -> lib.js'
		}
	]
};
