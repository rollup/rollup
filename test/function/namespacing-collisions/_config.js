var assert = require( 'assert' );

module.exports = {
	description: 'correctly namespaces when using * exports (#910)',
	exports: function ( exports ) {
		assert.deepEqual( exports, [ 'Material', 'Something' ] );
	}
};
