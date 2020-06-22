const path = require('path');

module.exports = {
	description: 'disallows non-top-level imports',
	error: {
		code: 'PARSE_ERROR',
		message: `'import' and 'export' may only appear at the top level`,
		id: path.resolve(__dirname, 'main.js'),
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
		watchFiles: [path.resolve(__dirname, 'main.js')],
		loc: {
			file: path.resolve(__dirname, 'main.js'),
			line: 2,
			column: 2
		},
		frame: `
			1: function foo() {
			2:   import foo from './foo.js';
			     ^
			3: }
		`
	}
};
