var assert = require( 'assert' );

module.exports = {
	description: 'Allow dynamic import support',
	options: {
		acorn: {
			plugins: { dynamicImport: true }
		}
	},
	runtimeError: function ( error ) {
		try {
			assert.equal( "Unexpected token import", error.message );
		}
		catch (err) {
			assert.equal( "Unexpected reserved word", error.message );
		}
	}
};
