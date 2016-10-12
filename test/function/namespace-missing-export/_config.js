var assert = require( 'assert' );

module.exports = {
	options: {
		onwarn: function ( msg ) {
			assert.equal( msg, `main.js (3:21) 'foo' is not exported by 'empty.js'. See https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module` );
		}
	}
};
