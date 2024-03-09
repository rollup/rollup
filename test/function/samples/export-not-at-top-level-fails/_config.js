const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'disallows non-top-level exports',
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
			2:   export { foo };
			     ^
			3: }
		`,
		watchFiles: [ID_MAIN],
		message: "main.js (2:2): 'import', and 'export' cannot be used outside of module code"
	}
});
