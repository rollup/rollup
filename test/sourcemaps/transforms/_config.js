var buble = require( 'buble' );
var MagicString = require( 'magic-string' );
var assert = require( 'assert' );
var getLocation = require( '../../utils/getLocation' );
var SourceMapConsumer = require( 'source-map' ).SourceMapConsumer;

module.exports = {
	description: 'preserves sourcemap chains when transforming',
	options: {
		plugins: [
			{
				transform: function ( source, id ) {
					return buble.transform( source, {
						transforms: { modules: false }
					});
				}
			},

			{
				transform: function ( source, id ) {
					var s = new MagicString( source );
					s.append( '\nassert.equal( 1 + 1, 2 );\nassert.equal( 2 + 2, 4 );' );

					return {
						code: s.toString(),
						map: s.generateMap({ hires: true })
					};
				}
			}
		]
	},
	test: function ( code, map ) {
		var smc = new SourceMapConsumer( map );

		var generatedLoc = getLocation( code, code.indexOf( '42' ) );
		var originalLoc = smc.originalPositionFor( generatedLoc );

		assert.ok( /foo/.test( originalLoc.source ) );
		assert.equal( originalLoc.line, 1 );
		assert.equal( originalLoc.column, 25 );

		generatedLoc = getLocation( code, code.indexOf( 'log' ) );
		originalLoc = smc.originalPositionFor( generatedLoc );

		assert.ok( /main/.test( originalLoc.source ) );
		assert.equal( originalLoc.line, 3 );
		assert.equal( originalLoc.column, 8 );
	}
};
