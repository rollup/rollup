const path = require('path');

module.exports = {
	description:
		'throws with an extended error message when failing to parse a file without .(m)js extension',
	error: {
		code: 'PARSE_ERROR',
		message:
			'Unexpected token (Note that you need plugins to import files that are not JavaScript)',
		id: path.join(__dirname, 'file.css'),
		parserError: {
			loc: {
				column: 0,
				line: 1
			},
			message: 'Unexpected token (1:0)',
			pos: 0,
			raisedAt: 1
		},
		pos: 0,
		watchFiles: [path.join(__dirname, 'file.css'), path.join(__dirname, 'main.js')],
		loc: {
			file: path.join(__dirname, 'file.css'),
			line: 1,
			column: 0
		},
		frame: `
			1: .special-class {
			   ^
			2:     color: black;
			3: }
		`
	}
};
