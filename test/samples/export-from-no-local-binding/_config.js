var assert = require( 'assert' );

module.exports = {
	description: 'export from does not create a local binding',

	error: function () {
		assert.ok( false, 'TODO: assertion is skipped because it is not used... we need to implement something like /*rollup: include */')
	}
};

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/export-from
