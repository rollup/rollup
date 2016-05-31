var assert = require( 'assert' );

module.exports = {
	description: 'imports the index file from a relative dir if the file to import does not exist',
	exports: function ( exports ) {
		assert.equal( exports, 42 );
	}
};
