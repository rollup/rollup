const assert = require( 'assert' );

module.exports = {
	description: 'throws on double default exports',
	error: err => {
		assert.equal( err.message, 'A module can only have one default export' );
	}
};
