var assert = require( 'assert' );

module.exports = {
	description: 'cannot have named exports if explicit export type is default',
	bundleOptions: {
		exports: 'default'
	},
	generateError: function ( err ) {
		assert.ok( /'default' was specified for options\.exports/.test( err.message ) );
	}
};
