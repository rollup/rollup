const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws when redeclaring a let binding with a nested var',
	error: {
		code: 'REDECLARATION_ERROR',
		frame: `
			2:   let foo = 'test';
			3:   {
			4:     var foo = 'other';
			           ^
			5:   }
			6:   console.log(foo);`,
		id: ID_MAIN,
		loc: {
			column: 8,
			file: ID_MAIN,
			line: 4
		},
		message: 'Identifier "foo" has already been declared',
		pos: 34,
		watchFiles: [ID_MAIN]
	}
});
