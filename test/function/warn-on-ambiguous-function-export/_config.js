const assert = require( 'assert' );

module.exports = {
	description: 'uses original name of default export function (#1011)',
	warnings: [
		{
			code: 'AMBIGUOUS_DEFAULT_EXPORT',
			message: `Ambiguous default export (is a call expression, but looks like a function declaration)`,
			pos: 15,
			loc: {
				file: require( 'path' ).resolve( __dirname, 'foo.js' ),
				line: 1,
				column: 15
			},
			frame: `
				1: export default function foo ( a, b ) {
				                  ^
				2:   assert.equal( a, b );
				3:   return 3;
			`,
			url: `https://github.com/rollup/rollup/wiki/Troubleshooting#ambiguous-default-export`
		}
	]
};
