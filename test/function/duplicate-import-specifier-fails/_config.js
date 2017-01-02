var path = require( 'path' );
var assert = require( 'assert' );

module.exports = {
	description: 'disallows duplicate import specifiers',
	error: {
		code: 'DUPLICATE_IMPORT',
		message: `Duplicated import 'a'`,
		pos: 12,
		loc: {
			file: path.resolve( __dirname, 'main.js' ),
			line: 1,
			column: 12
		},
		frame: `
			1: import { a, a } from './foo';
			               ^
			2: assert.equal(a, 1);
		`
	}
};

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/duplicate-import-specifier-fails
