var assert = require( 'assert' );

module.exports = {
	solo: true,
	description: 'Inherited classes should not be treeshaked',
	exports: function ( exports ) {
		assert.ok( exports.Thing );
	}
};
