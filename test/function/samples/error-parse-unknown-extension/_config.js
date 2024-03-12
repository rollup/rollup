const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_CSS = path.join(__dirname, 'file.css');

module.exports = defineTest({
	description:
		'throws with an extended error message when failing to parse a file without .(m)js extension',
	error: {
		cause: {
			code: 'PARSE_ERROR',
			pos: 0,
			message: 'Expression expected'
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
		message:
			'file.css (1:0): Expression expected (Note that you need plugins to import files that are not JavaScript)'
	}
});
