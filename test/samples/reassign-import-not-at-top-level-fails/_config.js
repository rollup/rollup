var path = require( 'path' );
var assert = require( 'assert' );

module.exports = {
	description: 'disallows assignments to imported bindings not at the top level',
	error: function ( err ) {
		assert.equal( err.file, path.resolve( __dirname, 'main.js' ) );
		assert.deepEqual( err.loc, { line: 7, column: 2 });
		assert.ok( /Illegal reassignment/.test( err.message ) );
	}
};

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/reassign-import-fails
