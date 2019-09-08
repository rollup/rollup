const path = require('path');

module.exports = {
	description: 'disallows non-top-level exports',
	error: {
		code: 'PARSE_ERROR',
		message: `'import' and 'export' may only appear at the top level`,
		pos: 19,
		watchFiles: [path.resolve(__dirname, 'main.js')],
		loc: {
			file: path.resolve(__dirname, 'main.js'),
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
