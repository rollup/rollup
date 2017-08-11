var path = require( 'path' );
var assert = require( 'assert' );

module.exports = {
	description: 'disallows duplicate imports',
	error: {
		code: 'PARSE_ERROR',
		message: `Identifier 'a' has already been declared`,
		pos: 36,
		loc: {
			file: path.resolve( __dirname, 'main.js' ),
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
};

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/duplicate-import-fails
