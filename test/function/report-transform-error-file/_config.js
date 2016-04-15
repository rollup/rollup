var assert = require( 'assert' );

module.exports = {
	description: 'reports which file caused a transform error',
	options: {
		plugins: [{
			transform: function ( code, id ) {
				if ( /foo/.test( id ) ) {
					throw new Error( 'nope' );
				}
			}
		}]
	},
	error: function ( err ) {
		assert.ok( ~err.message.indexOf( 'foo.js' ) );
	}
};
