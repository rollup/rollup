var assert = require( 'assert' );

module.exports = {
	description: 'renaming destructured object properties should request the correct property (#527)',

	// we must transpile the object destructuring to test it
	babel: true,

	exports: function ( exports ) {
		assert.equal( exports.env, process.env );
	}
};
