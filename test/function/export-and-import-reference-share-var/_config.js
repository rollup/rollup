var assert = require( 'assert' );

module.exports = {
	description: 'allows export and import reference to share name',
	exports: function ( exports ) {
		assert.equal( exports.b, 9 );
	},
	solo: true
};

// adapted from es6-module-transpiler
