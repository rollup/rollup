var assert = require( 'assert' );

module.exports = {
	description: 'disallows assignments to imported bindings not at the top level',
	error: function ( err ) {
		assert.ok( false, 'TODO choose error' );
	}
};

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/reassign-import-fails
