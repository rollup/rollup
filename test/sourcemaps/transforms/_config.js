var babel = require( 'babel-core' );
var MagicString = require( 'magic-string' );
var assert = require( 'assert' );
var getLocation = require( '../../utils/getLocation' );
var SourceMapConsumer = require( 'source-map' ).SourceMapConsumer;

module.exports = {
	solo: true,
	description: 'preserves sourcemap chains when transforming',
	options: {
		transform: [
			function ( source, id ) {
				return babel.transform( source, {
					blacklist: [ 'es6.modules' ],
					sourceMap: true
				});
			},

			function ( source, id ) {
				var s = new MagicString( source );
				s.prepend( '// this is a comment\n' );

				return {
					code: s.toString(),
					map: s.generateMap({ hires: true })
				};
			}
		]
	},
	test: function ( code, map ) {
		var smc = new SourceMapConsumer( map );

		var generatedLoc = getLocation( code, code.indexOf( 42 ) );
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
