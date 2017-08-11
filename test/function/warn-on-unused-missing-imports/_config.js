const path = require( 'path' );
const assert = require( 'assert' );

module.exports = {
	description: 'warns on missing (but unused) imports',
	warnings: [
		{
			code: 'NON_EXISTENT_EXPORT',
			id: path.resolve(__dirname, 'main.js'),
			source: path.resolve(__dirname, 'foo.js'),
			name: 'b',
			message: `Non-existent export 'b' is imported from foo.js`,
			pos: 12,
			loc: {
				file: path.resolve( __dirname, 'main.js' ),
				line: 1,
				column: 12
			},
			frame: `
				1: import { a, b } from './foo.js';
				               ^
				2:
				3: assert.equal( a, 42 );
			`
		}
	]
};
