var path = require( 'path' );
var assert = require( 'assert' );

module.exports = {
	description: 'plugins can be passed as functions',
	options: {
		plugins: [
			function () {
				return {
					options: function ( options ) {
						options.entry = path.resolve( __dirname, 'answer.js' );
					}
				}
			}
		]
	},
	exports: function ( answer ) {
		assert.equal( answer, 42 );
	}
}
