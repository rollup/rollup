const path = require('path');

module.exports = {
	description: 'disallows non-top-level exports',
	error: {
		code: 'PARSE_ERROR',
		message: `'import' and 'export' may only appear at the top level`,
		id: path.join(__dirname, 'main.js'),
		parserError: {
			loc: {
				column: 2,
				line: 2
			},
			message: "'import' and 'export' may only appear at the top level (2:2)",
			pos: 19,
			raisedAt: 25
		},
		pos: 19,
		watchFiles: [path.join(__dirname, 'main.js')],
		loc: {
			file: path.join(__dirname, 'main.js'),
			line: 2,
			column: 2
		},
		frame: `
			1: function foo() {
			2:   export { foo };
			     ^
			3: }
		`
	}
};
