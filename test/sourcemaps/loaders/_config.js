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
					if ( id.endsWith( 'foo.js' ) ) {
						id = id.replace( /foo.js$/, 'bar.js' );
					} else if ( id.endsWith( 'bar.js' ) ) {
						id = id.replace( /bar.js$/, 'foo.js' );
					}

					var out = babel.transformFileSync( id, {
						blacklist: [ 'es6.modules' ],
						sourceMap: true,
						comments: false // misalign the columns
					});

					if ( id.endsWith( 'main.js' ) ) {
						delete out.map.sources;
					} else {
						const slash = out.map.sources[0].lastIndexOf( '/' ) + 1;
						out.map.sources = out.map.sources.map( source => '../' + source.slice( slash ) );
						out.map.sourceRoot = 'fake';
					}

					return { code: out.code, map: out.map };
				}
			}
		]
	},
	test: function ( code, map ) {
		var smc = new SourceMapConsumer( map );

		var generatedLoc = getLocation( code, code.indexOf( '22' ) );
		var originalLoc = smc.originalPositionFor( generatedLoc );

		assert.equal( originalLoc.source, '../foo.js' );
		assert.equal( originalLoc.line, 1 );
		assert.equal( originalLoc.column, 32 );

		var generatedLoc = getLocation( code, code.indexOf( '20' ) );
		var originalLoc = smc.originalPositionFor( generatedLoc );

		assert.equal( originalLoc.source, '../bar.js' );
		assert.equal( originalLoc.line, 1 );
		assert.equal( originalLoc.column, 37 );

		generatedLoc = getLocation( code, code.indexOf( 'log' ) );
		originalLoc = smc.originalPositionFor( generatedLoc );

		assert.equal( originalLoc.source, '../main.js' );
		assert.ok( /columns/.test( smc.sourceContentFor( '../main.js' ) ) );
		assert.equal( originalLoc.line, 4 );
		assert.equal( originalLoc.column, 19 );
	}
};
