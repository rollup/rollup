var assert = require( 'assert' );

module.exports = {
	description: 'skips a dead branch (c)',
	code: function ( code ) {
		assert.equal( code.indexOf( 'function foo' ), -1, code );
	}
}
