var assert = require( 'assert' );

module.exports = {
	description: 'a module importing its own bindings',
	exports: function ( exports ) {
		assert.equal(exports.default, 'me');
		assert.equal(exports.another, 'me');
	},
	warnings: [
		{
			code: 'MIXED_EXPORTS',
			message: `Using named and default exports together. Consumers of your bundle will have to use bundle['default'] to access the default export, which may not be what you want. Use \`exports: 'named'\` to disable this warning`,
			url: `https://github.com/rollup/rollup/wiki/JavaScript-API#exports`
		}
	]
};
