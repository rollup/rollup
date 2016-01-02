var path = require( 'path' );
var assert = require( 'assert' );

var pathRelativeToCwd = path.relative( process.cwd(), path.resolve( __dirname, '_actual/bundle.js' ) );

module.exports = {
	description: 'source paths are relative (#344)',
	options: {
		moduleName: 'myModule',
		dest: pathRelativeToCwd
	},
	test: function ( code, map ) {
		assert.deepEqual( map.sources, [ '../main.js' ]);
	}
};
