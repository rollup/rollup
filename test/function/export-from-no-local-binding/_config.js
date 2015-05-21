var assert = require( 'assert' );

module.exports = {
	description: 'export from does not create a local binding',

	error: function ( err ) {
		assert.ok( false, 'TODO: assertion is skipped because it is not used... we need to implement something like /*rollup: include */')
	},

	skip: true
};

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/export-from
