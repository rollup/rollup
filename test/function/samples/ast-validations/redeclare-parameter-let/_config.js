const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws when redeclaring the parameter of a function as a let',
	error: {
		code: 'REDECLARATION_ERROR',
		frame: `
			1: function foo(x) {
			2:   let x; // throws
			         ^
			3: }`,
		id: ID_MAIN,
		loc: {
			column: 5,
			file: ID_MAIN,
			line: 2
		},
		message: 'main.js (2:5): Identifier "x" has already been declared',
		pos: 23,
		watchFiles: [ID_MAIN]
	}
});
