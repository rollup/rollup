const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_CSS = path.join(__dirname, 'file.css');

module.exports = defineTest({
	description:
		'throws with an extended error message when failing to parse a file without .(m)js extension',
	error: {
		cause: {
			pos: 0,
			loc: {
				line: 1,
				column: 0
			},
			raisedAt: 1,
			message: 'Unexpected token (1:0)'
		},
		code: 'PARSE_ERROR',
		id: ID_CSS,
		pos: 0,
		loc: {
			column: 0,
			file: ID_CSS,
			line: 1
		},
		frame: `
			1: .special-class {
			   ^
			2:     color: black;
			3: }
		`,
		watchFiles: [ID_CSS, ID_MAIN],
		message: 'Unexpected token (Note that you need plugins to import files that are not JavaScript)'
	}
});
