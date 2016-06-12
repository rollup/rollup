var babel = require( 'babel-core' );
var fs = require( 'fs' );
var assert = require( 'assert' );
var getLocation = require( '../../utils/getLocation' );
var SourceMapConsumer = require( 'source-map' ).SourceMapConsumer;

module.exports = {
	description: 'preserves sourcemap chains when transforming',
	options: {
		plugins: [
			{
				load: function ( id ) {
					if ( id.endsWith( 'main.js' ) ) {
						id = id.replace( /main.js$/, 'foo.js' );
					} else {
						id = id.replace( /foo.js$/, 'main.js' );
					}

					var out = babel.transformFileSync( id, {
						blacklist: [ 'es6.modules' ],
						sourceMap: true
					});

					const slash = out.map.sources[0].lastIndexOf( '/' ) + 1;
					out.map.sources = out.map.sources.map( source => '../' + source.slice( slash ) );
					out.map.sourceRoot = 'fake';

					return { code: out.code, map: out.map };
				}
			}
		]
	},
	test: function ( code, map ) {
		var smc = new SourceMapConsumer( map );

		var generatedLoc = getLocation( code, code.indexOf( '42' ) );
		var originalLoc = smc.originalPositionFor( generatedLoc );

		assert.equal( originalLoc.source, '../main.js' );
		assert.equal( originalLoc.line, 1 );
		assert.equal( originalLoc.column, 25 );

		generatedLoc = getLocation( code, code.indexOf( 'log' ) );
		originalLoc = smc.originalPositionFor( generatedLoc );

		assert.equal( originalLoc.source, '../foo.js' );
		assert.equal( originalLoc.line, 3 );
		assert.equal( originalLoc.column, 8 );
	}
};
