const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'disallows duplicate imports',
	error: {
		code: 'REDECLARATION_ERROR',
		message: 'Identifier "a" has already been declared',
		id: ID_MAIN,
		pos: 36,
		watchFiles: [ID_MAIN],
		loc: {
			file: ID_MAIN,
			line: 2,
			column: 9
		},
		frame: `
			1: import { a } from './foo';
			2: import { a } from './foo';
			            ^
			3:
			4: assert.equal(a, 1);
		`
	}
});

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/duplicate-import-fails
