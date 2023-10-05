const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'disallows updates to imported bindings',
	error: {
		code: 'PARSE_ERROR',
		cause: {
			code: 'PARSE_ERROR',
			message: 'cannot reassign to an imported binding',
			pos: 28
		},
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
		watchFiles: [ID_MAIN],
		message: 'cannot reassign to an imported binding'
	}
});

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/update-expression-of-import-fails
