const assert = require('assert');
const path = require('path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_DEP1 = path.join(__dirname, 'dep1.js');
const ID_DEP2 = path.join(__dirname, 'dep2.js');

module.exports = {
	description: 'handles circular reexports',
	exports(exports) {
		assert.strictEqual(exports.exists, 42);
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_DEP1, ID_DEP2, ID_DEP1],
			message: 'Circular dependency: dep1.js -> dep2.js -> dep1.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_DEP1, ID_DEP1],
			message: 'Circular dependency: dep1.js -> dep1.js'
		},
		{
			binding: 'doesNotExist',
			code: 'MISSING_EXPORT',
			id: ID_MAIN,
			message: '"doesNotExist" is not exported by "dep1.js", imported by "main.js".',
			exporter: ID_DEP1,
			pos: 17,
			loc: {
				file: ID_MAIN,
				line: 1,
				column: 17
			},
			frame: `
1: import { exists, doesNotExist } from './dep1.js';
                    ^
2: export { exists };`,
			url: 'https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module'
		}
	]
};
