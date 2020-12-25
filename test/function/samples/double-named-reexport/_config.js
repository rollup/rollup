const path = require('path');

module.exports = {
	description: 'throws on duplicate named exports',
	error: {
		code: 'PARSE_ERROR',
		message: `Duplicate export 'foo'`,
		id: path.join(__dirname, 'foo.js'),
		parserError: {
			loc: {
				column: 9,
				line: 3
			},
			message: "Duplicate export 'foo' (3:9)",
			pos: 38,
			raisedAt: 43
		},
		pos: 38,
		watchFiles: [path.join(__dirname, 'main.js'), path.join(__dirname, 'foo.js')],
		loc: {
			file: path.join(__dirname, 'foo.js'),
			line: 3,
			column: 9
		},
		frame: `
			1: var foo = 1;
			2: export { foo };
			3: export { foo } from './bar.js';
			            ^
		`
	}
};
