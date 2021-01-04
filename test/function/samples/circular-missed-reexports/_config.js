const assert = require('assert');
const path = require('path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_DEP1 = path.join(__dirname, 'dep1.js');

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
			message: "Non-existent export 'doesNotExist' is imported from dep1.js",
			name: 'doesNotExist',
			source: ID_DEP1,
			id: ID_MAIN,
			pos: 17,
			loc: {
				file: ID_MAIN,
				line: 1,
				column: 17
			},
			frame: `
1: import { exists, doesNotExist } from './dep1.js';
                    ^
2: export { exists };`
		}
	]
};
