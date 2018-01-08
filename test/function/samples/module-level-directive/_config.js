var assert = require( 'assert' );
var path = require( 'path' );

module.exports = {
	description: 'module level directives should not be included',
	error: {
		code: 'MODULE_LEVEL_DIRECTIVE',
		message: 'Cannot have directives on the module level (\'use asm\')',
		pos: 0,
		loc: {
			file: path.resolve( __dirname, 'main.js' ),
			line: 1,
			column: 0
		},
		frame: `
		1: \"use asm\";\n   ^\n2:\n3: export default 1;
		`
	}
};
