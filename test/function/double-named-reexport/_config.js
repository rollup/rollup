const assert = require( 'assert' );

module.exports = {
	description: 'throws on duplicate named exports',
	error: err => {
		assert.equal( err.message, `A module cannot have multiple exports with the same name ('foo')` );
	}
};
