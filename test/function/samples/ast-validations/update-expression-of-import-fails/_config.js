const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_FOO = path.join(__dirname, 'foo.js');

module.exports = defineTest({
	description: 'disallows updates to imported bindings',
	error: {
		code: 'ILLEGAL_REASSIGNMENT',
		id: ID_MAIN,
		pos: 28,
		loc: {
			column: 0,
			file: ID_MAIN,
			line: 3
		},
		frame: `
			1: import { a } from './foo';
			2:
			3: a++;
			   ^`,
		watchFiles: [ID_FOO, ID_MAIN],
		message: 'Illegal reassignment of import "a" in "main.js".'
	}
});

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/update-expression-of-import-fails
