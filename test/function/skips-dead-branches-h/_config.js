var assert = require( 'assert' );

module.exports = {
	description: 'not skips a dead conditional expression branch with nested ternary (h)',
	code: function ( code ) {
		assert.ok( code.indexOf( 'var c = true ? a === 3 ? a : b : a;' ) >= 0, code );
		assert.ok( code.indexOf( 'var d = false ? a !== 4 ? b : a : b;' ) >= 0, code );
	}
};
