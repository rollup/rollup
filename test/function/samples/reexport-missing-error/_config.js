const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_EMPTY = path.join(__dirname, 'empty.js');

module.exports = defineTest({
	description: 'reexporting a missing identifier should print an error',
	error: {
		binding: 'foo',
		code: 'MISSING_EXPORT',
		exporter: ID_EMPTY,
		id: ID_MAIN,
		url: 'https://rollupjs.org/troubleshooting/#error-name-is-not-exported-by-module',
		pos: 9,
		loc: {
			column: 9,
			file: ID_MAIN,
			line: 1
		},
		frame: `
			1: export { foo as bar } from './empty.js';
			            ^`,
		watchFiles: [ID_EMPTY, ID_MAIN],
		message: '"foo" is not exported by "empty.js", imported by "main.js".'
	}
});
