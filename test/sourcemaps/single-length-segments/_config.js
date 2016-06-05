var fs = require( 'fs' );
var path = require( 'path' );
var assert = require( 'assert' );
var getLocation = require( '../../utils/getLocation' );
var SourceMapConsumer = require( 'source-map' ).SourceMapConsumer;

var original = fs.readFileSync( path.resolve( __dirname, 'main.js' ), 'utf-8' );

module.exports = {
	description: 'handles single-length sourcemap segments',
	options: {
		plugins: [
			{
				transform: function () {
					return {
						code: fs.readFileSync( path.resolve( __dirname, 'output.js' ), 'utf-8' ),
						map: fs.readFileSync( path.resolve( __dirname, 'output.js.map' ), 'utf-8' )
					};
				}
			}
		],
		moduleName: 'x'
	},
	test: function ( code, map ) {
		var smc = new SourceMapConsumer( map );

		[ 'Foo', 'log' ].forEach( function ( token ) {
			var generatedLoc = getLocation( code, code.indexOf( token ) );
			var originalLoc = smc.originalPositionFor( generatedLoc );
			var expectedLoc = getLocation( original, original.indexOf( token ) );

			assert.ok( /main/.test( originalLoc.source ) );
			assert.equal( originalLoc.line, expectedLoc.line );
			assert.equal( originalLoc.column, expectedLoc.column );
		});
	}
};
