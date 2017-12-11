var assert = require( 'assert' );

module.exports = {
	description: 'Allow dynamic import support',
	options: {
		acorn: {
			plugins: { dynamicImport: true }
		}
	},
	runtimeError: function ( error ) {
		assert.equal( "Unexpected token import", error.message );
	}
};
