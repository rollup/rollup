const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'disallows assignments to imported bindings not at the top level',
	error: {
		code: 'PARSE_ERROR',
		cause: {
			code: 'PARSE_ERROR',
			message: 'cannot reassign to an imported binding',
			pos: 95
		},
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
		watchFiles: [ID_MAIN],
		message: 'cannot reassign to an imported binding'
	}
});

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/reassign-import-fails
