var assert = require( 'assert' );

module.exports = {
	description: 'a module importing its own bindings',
	exports: function ( exports ) {
		assert.equal(exports.result, 4);
	}
};
