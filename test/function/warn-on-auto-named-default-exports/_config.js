var assert = require( 'assert' );

module.exports = {
	description: 'warns if default and named exports are used in auto mode',
	warnings: function ( warnings ) {
		assert.deepEqual( warnings, [
			'Using named and default exports together. Consumers of your bundle will have to use bundle[\'default\'] to access the default export, which may not be what you want. Use `exports: \'named\'` to disable this warning. See https://github.com/rollup/rollup/wiki/JavaScript-API#exports for more information'
		]);
	}
};
