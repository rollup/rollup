const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'handles circular reexports',
	exports(exports) {
		assert.strictEqual(exports.exists, 42);
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['dep1.js', 'dep2.js', 'dep1.js'],
			importer: 'dep1.js',
			message: 'Circular dependency: dep1.js -> dep2.js -> dep1.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['dep1.js', 'dep1.js'],
			importer: 'dep1.js',
			message: 'Circular dependency: dep1.js -> dep1.js'
		},
		{
			code: 'NON_EXISTENT_EXPORT',
			frame: `
1: import { exists, doesNotExist } from './dep1.js';
                    ^
2: export { exists };`,
			id: path.resolve(__dirname, 'main.js'),
			loc: {
				column: 17,
				file: path.resolve(__dirname, 'main.js'),
				line: 1
			},
			message: "Non-existent export 'doesNotExist' is imported from dep1.js",
			name: 'doesNotExist',
			pos: 17,
			source: path.resolve(__dirname, 'dep1.js')
		}
	]
};
