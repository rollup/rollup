const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws when redeclaring a default import with a function',
	error: {
		code: 'REDECLARATION_ERROR',
		message: 'Identifier "foo" has already been declared',
		id: ID_MAIN,
		pos: 56,
		watchFiles: [ID_MAIN],
		loc: {
			file: ID_MAIN,
			line: 4,
			column: 9
		},
		frame: `
			2:
			3: console.log(foo);
			4: function foo() {}
			            ^`
	}
});
