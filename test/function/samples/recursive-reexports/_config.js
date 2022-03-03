const assert = require('assert');
module.exports = {
	description: 'handles recursive namespace reexports',
	exports(exports) {
		assert.deepStrictEqual(exports, { main: 'main', other: 'other' });
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['main.js', 'other.js', 'main.js'],
			importer: 'main.js',
			message: 'Circular dependency: main.js -> other.js -> main.js'
		}
	]
};
