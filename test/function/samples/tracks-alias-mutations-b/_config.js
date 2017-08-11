const assert = require( 'assert' );

const foo = {};

module.exports = {
	description: 'tracks mutations of aliased objects',
	context: {
		foo
	},
	exports () {
		assert.equal( foo.x, 42 );
	}
};
