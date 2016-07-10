var assert = require( 'assert' );

var warned = false;

module.exports = {
	description: 'warns about use of eval',
	options: {
		onwarn: function ( message ) {
			warned = true;
			assert.ok( /Use of `eval` \(in .+?main\.js\) is strongly discouraged, as it poses security risks and may cause issues with minification\. See https:\/\/github.com\/rollup\/rollup\/wiki\/Troubleshooting#avoiding-eval for more details/.test( message ) );
		}
	},
	exports: function () {
		assert.ok( warned, 'did not warn' );
	}
};
