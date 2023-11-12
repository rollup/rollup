const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws when redeclaring a var binding as a class',
	error: {
		code: 'REDECLARATION_ERROR',
		frame: `
			1: var foo;
			2: class foo {}
			         ^`,
		id: ID_MAIN,
		loc: {
			column: 6,
			file: ID_MAIN,
			line: 2
		},
		message: 'Identifier "foo" has already been declared',
		pos: 15,
		watchFiles: [ID_MAIN]
	}
});
