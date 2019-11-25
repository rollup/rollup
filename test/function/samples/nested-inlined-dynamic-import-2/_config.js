const assert = require('assert');

module.exports = {
	description: 'deconflicts variables when nested dynamic imports are inlined',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['lib1.js', 'lib2.js', 'lib1.js'],
			importer: 'lib1.js',
			message: 'Circular dependency: lib1.js -> lib2.js -> lib1.js'
		}
	],
	exports(exports) {
		return exports().then(result => assert.strictEqual(result, 43));
	}
};
