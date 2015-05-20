var assert = require( 'assert' );

module.exports = {
	description: 'disallows updates to imported bindings',
	error: function ( err ) {
		assert.ok( false, 'TODO choose error' );
	}
};

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/update-expression-of-import-fails
