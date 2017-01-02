var path = require( 'path' );
var assert = require( 'assert' );

module.exports = {
	description: 'errors if code calls an internal namespace',
	error: {
		code: 'CANNOT_CALL_NAMESPACE',
		message: `Cannot call a namespace ('foo')`,
		pos: 33,
		loc: {
			file: path.resolve( __dirname, 'main.js' ),
			line: 2,
			column: 0
		},
		frame: `
			1: import * as foo from './foo.js';
			2: foo();
			   ^
		`
	}
};
