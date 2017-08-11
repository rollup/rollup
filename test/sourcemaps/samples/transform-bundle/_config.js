var uglify = require( 'uglify-js' );
var assert = require( 'assert' );
var getLocation = require( '../../getLocation' );
var SourceMapConsumer = require( 'source-map' ).SourceMapConsumer;

module.exports = {
	description: 'preserves sourcemap chains when transforming',
	options: {
		plugins: [
			{
				transformBundle: function ( code ) {
					var options = {
						sourceMap: {
						    filename: 'x' // trigger sourcemap generation
						}
					};

					return uglify.minify( code, options );
				}
			}
		]
	},
	test: function ( code, map ) {
		var smc = new SourceMapConsumer( map );

		var generatedLoc = getLocation( code, code.indexOf( '42' ) );
		var originalLoc = smc.originalPositionFor( generatedLoc );

		assert.ok( /main/.test( originalLoc.source ) );
		assert.equal( originalLoc.line, 1 );
		assert.equal( originalLoc.column, 13 );

		generatedLoc = getLocation( code, code.indexOf( 'log' ) );
		originalLoc = smc.originalPositionFor( generatedLoc );

		assert.equal( originalLoc.line, 1 );
		assert.equal( originalLoc.column, 8 );
	}
};
