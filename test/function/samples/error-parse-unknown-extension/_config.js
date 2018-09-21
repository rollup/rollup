const path = require('path');

module.exports = {
	description:
		'throws with an extended error message when failing to parse a file without .(m)js extension',
	error: {
		code: 'PARSE_ERROR',
		message:
			'Unexpected token (Note that you need plugins to import files that are not JavaScript)',
		pos: 0,
		loc: {
			file: path.resolve(__dirname, 'file.css'),
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
