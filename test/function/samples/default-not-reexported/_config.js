const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_FOO = path.join(__dirname, 'foo.js');
const ID_BAR = path.join(__dirname, 'bar.js');

module.exports = defineTest({
	description: 'default export is not re-exported with export *',
	error: {
		binding: 'default',
		code: 'MISSING_EXPORT',
		exporter: ID_FOO,
		message: '"default" is not exported by "foo.js", imported by "main.js".',
		id: ID_MAIN,
		pos: 7,
		watchFiles: [ID_BAR, ID_FOO, ID_MAIN],
		loc: {
			file: ID_MAIN,
			line: 1,
			column: 7
		},
		frame: `
			1: import def from './foo.js';
			          ^
			2:
			3: console.log( def );
		`,
		url: `https://rollupjs.org/troubleshooting/#error-name-is-not-exported-by-module`
	}
});
