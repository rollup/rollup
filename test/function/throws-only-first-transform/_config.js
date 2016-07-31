var assert = require( 'assert' );
var path = require( 'path' );

module.exports = {
	description: 'throws error only with first plugin transform',
	options: {
		plugins: [
			{
				name: 'plugin1',
				transform: function () {
					throw Error('Something happend 1');
				}
			},
			{
				name: 'plugin2',
				transform: function () {
					throw Error('Something happend 2');
				}
			}
		]
	},
	error: function ( err ) {
		var id = path.resolve( __dirname, 'main.js' );
		assert.equal( err.rollupTransform, true );
		assert.equal( err.id, id );
		assert.equal( err.plugin, 'plugin1' );
		assert.equal( err.message, 'Error transforming ' + id + ' with \'plugin1\' plugin: Something happend 1' );
	}
};