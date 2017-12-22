var assert = require( 'assert' );

module.exports = {
	description: 'Dynamic import string specifier resolving',
	options: {
		experimentalDynamicImport: true,
		plugins: [{
			resolveDynamicImport ( specifier, parent ) {
				return 'asdf';
			}
		}]
	},
	code: function ( code ) {
		assert( code.indexOf( 'import( "asdf" )' ) > 0 );
	},
	runtimeError: function ( error ) {
		try {
			assert.equal( "Unexpected token import", error.message );
		}
		catch ( e ) {
			assert.equal( "Unexpected reserved word", error.message );
		}
	}
};
