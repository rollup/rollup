const path = require('path');

module.exports = {
	description: 'disallows duplicate imports',
	error: {
		code: 'PARSE_ERROR',
		message: `Identifier 'a' has already been declared`,
		id: path.join(__dirname, 'main.js'),
		parserError: {
			loc: {
				column: 9,
				line: 2
			},
			message: "Identifier 'a' has already been declared (2:9)",
			pos: 36,
			raisedAt: 39
		},
		pos: 36,
		watchFiles: [path.join(__dirname, 'main.js')],
		loc: {
			file: path.join(__dirname, 'main.js'),
			line: 2,
			column: 9
		},
		frame: `
			1: import { a } from './foo';
			2: import { a } from './foo';
			            ^
			3:
			4: assert.equal(a, 1);
		`
	}
};

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/duplicate-import-fails
