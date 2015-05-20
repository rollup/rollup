var assert = require( 'assert' );

module.exports = {
	description: 'disallows reassignments to namespace exports',
	error: function ( err ) {
		console.log( err );
		assert.ok( false, 'TODO figure out correct error' );
	}
};

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/namespace-reassign-import-fails
