var assert = require( 'assert' );

module.exports = {
	description: 'throws error if load returns something wacky',
	options: {
		plugins: [{
			load: function () {
				return 42;
			}
		}]
	},
	error: function ( err ) {
		assert.ok( /load hook should return a string, a \{ code, map \} object, or nothing\/null/.test( err.message ) );
	}
};
