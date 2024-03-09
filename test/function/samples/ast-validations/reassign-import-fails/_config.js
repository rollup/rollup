const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_FOO = path.join(__dirname, 'foo.js');

module.exports = defineTest({
	description: 'disallows assignments to imported bindings',
	error: {
		code: 'ILLEGAL_REASSIGNMENT',
		id: ID_MAIN,
		pos: 113,
		loc: {
			column: 0,
			file: ID_MAIN,
			line: 8
		},
		frame: `
			6: });
			7:
			8: x = 10;
			   ^`,
		watchFiles: [ID_FOO, ID_MAIN],
		message: 'main.js (8:0): Illegal reassignment of import "x" in "main.js".'
	}
});

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/reassign-import-fails
