const path = require( 'path' );
const assert = require( 'assert' );

module.exports = {
	description: 'warns on missing (but unused) imports',
	warnings: warnings => {
		assert.deepEqual( warnings, [
			`Non-existent export 'b' is imported from ${path.resolve(__dirname, 'foo.js')} by ${path.resolve(__dirname, 'main.js')}`
		]);
	}
};
