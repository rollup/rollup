require( 'source-map-support' ).install();
require( 'console-group' ).install();

var path = require( 'path' );
var sander = require( 'sander' );
var assert = require( 'assert' );
var rollup = require( '../dist/rollup' );

var SAMPLES = path.resolve( __dirname, 'samples' );

describe( 'rollup', function () {
	it( 'exists', function () {
		assert.ok( !!rollup );
	});

	it( 'has a rollup method', function () {
		assert.equal( typeof rollup.rollup, 'function' );;
	});

	sander.readdirSync( SAMPLES ).forEach( function ( dir ) {
		if ( dir[0] === '.' ) return; // .DS_Store...

		var config = require( SAMPLES + '/' + dir + '/_config' );

		( config.solo ? it.only : it )( config.description, function () {
			return rollup.rollup( SAMPLES + '/' + dir + '/main.js' )
				.then( function ( bundle ) {
					var result = bundle.generate({
						format: 'cjs'
					});

					try {
						var fn = new Function( 'assert', result.code );
						fn( assert );
					} catch ( err ) {
						console.log( result.code );
						throw err;
					}

					if ( config.show ) {
						console.log( result.code + '\n\n\n' );
					}
				});
		});
	});
});