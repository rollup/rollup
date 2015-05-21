var path = require( 'path' );
var assert = require( 'assert' );

module.exports = {
	description: 'disallows duplicate imports',
	error: function ( err ) {
		assert.equal( err.file, path.resolve( __dirname, 'main.js' ) );
		assert.deepEqual( err.loc, { line: 2, column: 9 });
		assert.ok( /Duplicated import/.test( err.message ) );
	}
};

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/duplicate-import-fails
