const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_EMPTY = path.join(__dirname, 'empty.js');

module.exports = defineTest({
	description: 'marking an imported, but unexported, identifier should throw',
	error: {
		binding: 'default',
		code: 'MISSING_EXPORT',
		exporter: ID_EMPTY,
		id: ID_MAIN,
		url: 'https://rollupjs.org/troubleshooting/#error-name-is-not-exported-by-module',
		pos: 7,
		loc: {
			column: 7,
			file: ID_MAIN,
			line: 1
		},
		frame: `
			1: import a from './empty.js';
			          ^
			2:
			3: a();
		`,
		watchFiles: [ID_EMPTY, ID_MAIN],
		message: '"default" is not exported by "empty.js", imported by "main.js".'
	}
});
