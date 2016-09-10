const path = require( 'path' );
const assert = require( 'assert' );

module.exports = {
	description: 'throws on duplicate named exports',
	error: err => {
		assert.equal( err.message, `Duplicate export 'foo' (3:9) in ${path.resolve(__dirname, 'foo.js')}` );
	}
};
