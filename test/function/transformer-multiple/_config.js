var assert = require( 'assert' );

module.exports = {
	description: 'accepts multiple transformer functions',
	options: {
		transform: [
			function ( code, path ) {
				return code.replace( /MAGIC_NUMBER/g, 3 );
			},

			function ( code, path ) {
				return code.replace( /\d+/g, function ( match ) {
					return 2 * +match;
				});
			}
		]
	},
	exports: function ( exports ) {
		assert.equal( exports.magicNumber, 6 );
	}
}
