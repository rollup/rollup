const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws when redeclaring an import with a var',
	error: {
		code: 'REDECLARATION_ERROR',
		message: 'Identifier "foo" has already been declared',
		id: ID_MAIN,
		pos: 55,
		watchFiles: [ID_MAIN],
		loc: {
			file: ID_MAIN,
			line: 4,
			column: 4
		},
		frame: `
			2:
			3: console.log(foo);
			4: var foo = 2;
			       ^`
	}
});
