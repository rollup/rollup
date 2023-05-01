const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_REEXPORT = path.join(__dirname, 'reexport.js');
const ID_FIRST = path.join(__dirname, 'first.js');
const ID_SECOND = path.join(__dirname, 'second.js');

module.exports = defineTest({
	description: 'throws when a conflicting binding is imported via a named import',
	error: {
		binding: 'foo',
		code: 'MISSING_EXPORT',
		exporter: ID_REEXPORT,
		id: ID_MAIN,
		url: 'https://rollupjs.org/troubleshooting/#error-name-is-not-exported-by-module',
		pos: 9,
		loc: {
			column: 9,
			file: ID_MAIN,
			line: 1
		},
		frame: `
			1: import { foo } from './reexport.js';
			            ^
			2:
			3: assert.strictEqual(foo, 1);`,
		watchFiles: [ID_FIRST, ID_MAIN, ID_REEXPORT, ID_SECOND],
		message: '"foo" is not exported by "reexport.js", imported by "main.js".'
	}
});
