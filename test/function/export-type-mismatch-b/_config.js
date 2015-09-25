var assert = require( 'assert' );

module.exports = {
	description: 'export type must be auto, default, named or none',
	bundleOptions: {
		exports: 'blah'
	},
	generateError: function ( err ) {
		assert.ok( /options\.exports must be 'default', 'named', 'none', 'auto', or left unspecified/.test( err.message ) );
	}
};
