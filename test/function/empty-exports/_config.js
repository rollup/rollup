var assert = require( 'assert' );

var warned = false;

module.exports = {
	description: 'warns on export {}, but does not fail',
	options: {
		onwarn: function ( msg ) {
			warned = true;
			assert.ok( /main\.js has an empty export declaration/.test( msg ) );
		}
	},
	exports: function ( exports ) {
		assert.equal( Object.keys( exports ).length, 0 );
		assert.ok( warned, 'did not warn' );
	}
};
