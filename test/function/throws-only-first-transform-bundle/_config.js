var assert = require( 'assert' );

module.exports = {
	description: 'throws error only with first plugin transformBundle',
	options: {
		plugins: [
			{
				name: 'plugin1',
				transformBundle: function () {
					throw Error('Something happend 1');
				}
			},
			{
				name: 'plugin2',
				transformBundle: function () {
					throw Error('Something happend 2');
				}
			}
		]
	},
	generateError: function ( err ) {
		assert.equal( err.plugin, 'plugin1' );
		assert.equal( err.message, 'Error transforming bundle with \'plugin1\' plugin: Something happend 1' );
	}
};