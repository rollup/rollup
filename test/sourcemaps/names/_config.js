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
		var match = /Object\.create\( ([^\.]+)\.prototype/.exec( code );

		var deconflictedName = match[1];
		if ( deconflictedName === 'Foo' ) throw new Error( 'Need to update this test!' );

		var smc = new SourceMapConsumer( map );

		var index = code.indexOf( deconflictedName );
		var generatedLoc = getLocation( code, index );
		var originalLoc = smc.originalPositionFor( generatedLoc );
		assert.equal( originalLoc.name, 'Foo' );

		index = code.indexOf( deconflictedName, index + 1 );
		generatedLoc = getLocation( code, index );
		originalLoc = smc.originalPositionFor( generatedLoc );
		assert.equal( originalLoc.name, 'Bar' );
	}
};
