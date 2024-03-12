const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws when redeclaring a function binding as a function in a block scope',
	error: {
		code: 'REDECLARATION_ERROR',
		frame: `
			1: {
			2:   function foo() {}
			3:   function foo() {}
			              ^
			4: }`,
		id: ID_MAIN,
		loc: {
			column: 10,
			file: ID_MAIN,
			line: 3
		},
		message: 'main.js (3:10): Identifier "foo" has already been declared',
		pos: 31,
		watchFiles: [ID_MAIN]
	}
});
