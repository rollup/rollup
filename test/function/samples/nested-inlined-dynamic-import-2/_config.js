const assert = require('node:assert');
const path = require('node:path');
const ID_LIB1 = path.join(__dirname, 'lib1.js');
const ID_LIB2 = path.join(__dirname, 'lib2.js');

module.exports = defineTest({
	description: 'deconflicts variables when nested dynamic imports are inlined',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_LIB1, ID_LIB2, ID_LIB1],
			message: 'Circular dependency: lib1.js -> lib2.js -> lib1.js'
		}
	],
	exports(exports) {
		return exports().then(result => assert.strictEqual(result, 43));
	}
});
