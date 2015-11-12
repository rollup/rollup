var assert = require( 'assert' );

module.exports = {
	description: 'skips a dead branch (d)',
	code: function ( code ) {
		assert.equal( code.indexOf( 'obj.foo = function' ), -1, code );
	}
}
