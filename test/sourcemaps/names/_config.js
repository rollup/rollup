var path = require( 'path' );
var assert = require( 'assert' );
var getLocation = require( '../../utils/getLocation' );
var SourceMapConsumer = require( 'source-map' ).SourceMapConsumer;

module.exports = {
	description: 'names are recovered (https://github.com/rollup/rollup/issues/101)',
	options: {
		moduleName: 'myModule'
	},
	test: function ( code, map ) {
		var smc = new SourceMapConsumer( map );
		var generatedLoc, originalLoc;

		var match = /Object\.create\( ([^\.]+)\.prototype/.exec( code );
		if ( !match ) throw new Error( 'errr...' );

		var deconflictedName = match[1];
		if ( deconflictedName === 'Foo' ) throw new Error( 'Need to update this test!' );

		var pattern = new RegExp( deconflictedName, 'g' );

		var index = code.indexOf( deconflictedName );
		generatedLoc = getLocation( code, index );
		originalLoc = smc.originalPositionFor( generatedLoc );
		assert.equal( originalLoc.name, 'Foo' );

		var index = code.indexOf( deconflictedName, index + 1 );
		generatedLoc = getLocation( code, index );
		originalLoc = smc.originalPositionFor( generatedLoc );
		assert.equal( originalLoc.name, 'Bar' );
	}
};
