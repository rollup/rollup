const path = require('path');

const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = {
	description: 'throws when a conflicting binding is imported via a named import',
	error: {
		code: 'MISSING_EXPORT',
		frame: `
1: import { foo } from './reexport.js';
            ^
2:
3: assert.strictEqual(foo, 1);`,
		id: ID_MAIN,
		loc: {
			column: 9,
			file: ID_MAIN,
			line: 1
		},
		message: "'foo' is not exported by reexport.js, imported by main.js",
		pos: 9,
		url: 'https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module',
		watchFiles: [
			ID_MAIN,
			path.join(__dirname, 'reexport.js'),
			path.join(__dirname, 'first.js'),
			path.join(__dirname, 'second.js')
		]
	}
};
