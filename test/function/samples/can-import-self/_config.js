const assert = require('node:assert');
const path = require('node:path');
const ID_LIB = path.join(__dirname, 'lib.js');

module.exports = defineTest({
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
});
