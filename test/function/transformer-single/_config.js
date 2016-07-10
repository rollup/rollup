var assert = require( 'assert' );

module.exports = {
	description: 'accepts a single transformer function',
	options: {
		plugins: [{
			transform: function ( code, path ) {
				return code.replace( /MAGIC_NUMBER/g, 3 );
			}
		}]
	},
	exports: function ( exports ) {
		assert.equal( exports.magicNumber, 3 );
	}
};
