var assert = require( 'assert' );

module.exports = {
	solo: true,
	description: 'resolves more pathological cyclical dependencies gracefully',
	options: {
		onwarn: function ( message ) {
			console.log(message);
			// assert.ok( /unable to evaluate without/.test( message ) );
		}
	}
};
