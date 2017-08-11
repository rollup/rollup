var assert = require( 'assert' );

module.exports = {
	description: 'resolves even more pathological cyclical dependencies gracefully',
	buble: true,
	options: {
		onwarn: function ( message ) {
			assert.ok( /unable to evaluate without/.test( message ) );
		}
	}
};
