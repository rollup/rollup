var assert = require( 'assert' );

module.exports = {
	description: 'cannot have named exports if explicit export type is default',
	bundleOptions: {
		exports: 'none'
	},
	generateError: function ( err ) {
		assert.ok( /'none' was specified for options\.exports/.test( err.message ) );
	}
};
