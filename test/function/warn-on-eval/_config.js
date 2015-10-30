var path = require( 'path' );
var assert = require( 'assert' );

var warned = false;

module.exports = {
	description: 'warns about use of eval',
	options: {
		onwarn: function ( message ) {
			warned = true;
			assert.equal( message, 'Use of `eval` (in ' + path.resolve( __dirname, 'main.js' ) + ') is discouraged, as it may cause issues with minification. See https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval for more details' );
		}
	},
	exports: function () {
		assert.ok( warned, 'did not warn' );
	}
};
