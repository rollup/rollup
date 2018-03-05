var path = require('path');
var assert = require('assert');

module.exports = {
	description: 'disallows non-top-level imports',
	error: {
		code: 'PARSE_ERROR',
		message: `'import' and 'export' may only appear at the top level`,
		pos: 19,
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
