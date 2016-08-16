var assert = require( 'assert' );

module.exports = {
	description: 'checks that entry is resolved',
	options: {
		entry: '/not/a/path/that/actually/really/exists'
	},
	error: function ( err ) {
		assert.ok( /Could not resolve entry/.test( err.message ) );
	}
};
