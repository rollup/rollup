var assert = require( 'assert' );

module.exports = {
	description: 'disallows duplicate import specifiers',
	error: function ( err ) {
		assert.ok( false ); // TK - pick an error message
	}
};

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/duplicate-import-specifier-fails
