const assert = require('assert');
const path = require('path');
const ID_LIB = path.join(__dirname, 'lib.js');

module.exports = {
	description: 'a module importing its own bindings',
	exports(exports) {
		assert.equal(exports.result, 4);
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_LIB, ID_LIB],
			message: 'Circular dependency: lib.js -> lib.js'
		}
	]
};
