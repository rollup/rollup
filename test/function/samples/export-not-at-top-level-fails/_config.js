const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'disallows non-top-level exports',
	error: {
		cause: {
			pos: 19,
			loc: {
				line: 2,
				column: 2
			},
			raisedAt: 25,
			message: "'import' and 'export' may only appear at the top level (2:2)"
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
			2:   export { foo };
			     ^
			3: }
		`,
		watchFiles: [ID_MAIN],
		message: "'import' and 'export' may only appear at the top level"
	}
});
