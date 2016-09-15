var assert = require( 'assert' );

module.exports = {
	description: 'correctly namespaces when using * exports, take two (#910)',
	exports: function ( exports ) {
		assert.deepEqual( exports, ['Material', 'MaterialAgain', 'Something', 'SomethingAgain'] );
	}
};
