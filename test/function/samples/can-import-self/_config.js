var assert = require( 'assert' );

module.exports = {
	description: 'a module importing its own bindings',
	exports: function ( exports ) {
		assert.equal( exports.result, 4 );
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			importer: 'lib.js',
			message: 'Circular dependency: lib.js -> lib.js'
		}
	]
};
