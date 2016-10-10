const assert = require( 'assert' );

module.exports = {
	description: 'default export is not re-exported with export *',
	error ( error ) {
		assert.equal( error.message, `'default' is not exported by foo.js (imported by main.js). For help fixing this error see https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module` );
	}
};
