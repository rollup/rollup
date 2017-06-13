var assert = require( 'assert' );
var uglify = require( 'uglify-js' );
var MagicString = require( 'magic-string' );
var getLocation = require( '../../utils/getLocation' );
var SourceMapConsumer = require( 'source-map' ).SourceMapConsumer;

module.exports = {
	description: 'names are recovered if transforms are used',
	options: {
		plugins: [
			{
				transform: function ( code ) {
					var s = new MagicString( code );
					var pattern = /mangleMe/g;
					var match;

					while ( match = pattern.exec( code ) ) {
						s.overwrite( match.index, match.index + match[0].length, 'mangleMePlease', { storeName: true, contentOnly: false } );
					}

					return {
						code: s.toString(),
						map: s.generateMap({ hires: true })
					};
				},
				transformBundle: function ( code ) {
					return uglify.minify( code, {
						fromString: true,
						outSourceMap: 'x'
					});
				}
			}
		]
	},
	test: function ( code, map ) {
		var smc = new SourceMapConsumer( map );

		var generatedLoc = getLocation( code, /\w+=["']this/.exec( code ).index );
		var originalLoc = smc.originalPositionFor( generatedLoc );

		assert.deepEqual( originalLoc, {
			source: '../a.js',
			line: 1,
			column: 4,
			name: 'mangleMe'
		});

		generatedLoc = getLocation( code, /\w+=["']nor/.exec( code ).index );
		originalLoc = smc.originalPositionFor( generatedLoc );

		assert.deepEqual( originalLoc, {
			source: '../b.js',
			line: 1,
			column: 4,
			name: 'mangleMe'
		});
	}
};
