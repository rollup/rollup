const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_FOO = path.join(__dirname, 'foo.js');

module.exports = defineTest({
	description: 'disallows assignments to imported bindings not at the top level',
	error: {
		code: 'ILLEGAL_REASSIGNMENT',
		id: ID_MAIN,
		pos: 95,
		loc: {
			column: 2,
			file: ID_MAIN,
			line: 7
		},
		frame: `
			5: }
			6: export function bar () {
			7:   x = 1;
			     ^
			8: }`,
		watchFiles: [ID_FOO, ID_MAIN],
		message: 'main.js (7:2): Illegal reassignment of import "x" in "main.js".'
	}
});

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/reassign-import-fails
