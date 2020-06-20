const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'handles circular reexports',
	exports(exports) {
		assert.strictEqual(exports.exists, 42);
	},
	error: {
		code: 'MISSING_EXPORT',
		id: path.resolve(__dirname, 'dep2.js'),
		frame: `
1: export { doesNotExist } from './dep1.js';
            ^`,
		loc: {
			column: 9,
			file: path.resolve(__dirname, 'dep2.js'),
			line: 1
		},
		message: "'doesNotExist' is not exported by dep1.js, imported by dep2.js",
		pos: 9,
		url: 'https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module',
		watchFiles: [
			path.resolve(__dirname, 'main.js'),
			path.resolve(__dirname, 'dep1.js'),
			path.resolve(__dirname, 'dep2.js')
		]
	}
};
