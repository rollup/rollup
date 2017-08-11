var assert = require( 'assert' );
var MagicString = require( 'magic-string' );

module.exports = {
	description: 'allows sourcemap chains with some untransformed modules (#404)',
	options: {
		plugins: [{
			transform: function ( code, id ) {
				if ( /untransformed-modules\/foo/.test( id ) ) {
					var s = new MagicString( code );
					var index = code.indexOf( '1' );
					s.overwrite( index, index + 1, '2' );

					return {
						code: s.toString(),
						map: s.generateMap({ hires: true })
					};
				}
			}
		}]
	},
	test: function () {
		assert.ok( true );
	}
};
