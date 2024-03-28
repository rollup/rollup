const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws when redeclaring a nested var binding with let',
	error: {
		code: 'REDECLARATION_ERROR',
		frame: `
			3:     var foo = 'other';
			4:   }
			5:   let foo = 'test';
			         ^
			6:   console.log(foo);
			7: }`,
		id: ID_MAIN,
		loc: {
			column: 6,
			file: ID_MAIN,
			line: 5
		},
		message: 'main.js (5:6): Identifier "foo" has already been declared',
		pos: 39,
		watchFiles: [ID_MAIN]
	}
});
