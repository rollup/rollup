const path = require( 'path' );
const assert = require( 'assert' );

module.exports = {
	description: 'throws on double default exports',
	error: err => {
		assert.equal( err.message, `Duplicate export 'default' (2:7) in ${path.resolve(__dirname, 'foo.js')}` );
	}
};
