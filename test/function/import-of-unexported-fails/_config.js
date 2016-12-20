var assert = require( 'assert' );

module.exports = {
	description: 'marking an imported, but unexported, identifier should throw',
	error: function ( err ) {
		assert.equal( err.message, `'default' is not exported by empty.js (imported by main.js). For help fixing this error see https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module` );
	}
};
