const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'disallows non-top-level imports',
	error: {
		cause: {
			code: 'PARSE_ERROR',
			pos: 19,
			message: "'import', and 'export' cannot be used outside of module code"
		},
		code: 'PARSE_ERROR',
		id: ID_MAIN,
		pos: 19,
		loc: {
			column: 2,
			file: ID_MAIN,
			line: 2
		},
		frame: `
			1: function foo() {
			2:   import foo from './foo.js';
			     ^
			3: }
		`,
		watchFiles: [ID_MAIN],
		message: "'import', and 'export' cannot be used outside of module code"
	}
});
