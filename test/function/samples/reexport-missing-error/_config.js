var path = require( 'path' );
var assert = require( 'assert' );

module.exports = {
	description: 'reexporting a missing identifier should print an error',
	error: {
		code: 'MISSING_EXPORT',
		message: `'foo' is not exported by empty.js`,
		pos: 9,
		loc: {
			file: path.resolve( __dirname, 'main.js' ),
			line: 1,
			column: 9
		},
		frame: `
			1: export { foo as bar } from './empty.js';
			            ^
		`,
		url: 'https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module'
	}
};
