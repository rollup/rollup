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

		var pattern = /Object\.create\( ([\w\$\d]+)\.prototype \)/;
		var match = pattern.exec( code );

		var generatedLoc = getLocation( code, match.index + 'Object.create ( '.length );
		var original = smc.originalPositionFor( generatedLoc );
		assert.equal( original.name, 'Bar' );

		pattern = /function Foo([\w\$\d]+)/;
		match = pattern.exec( code );

		generatedLoc = getLocation( code, match.index + 'function '.length );
		original = smc.originalPositionFor( generatedLoc );
		assert.equal( original.name, 'Foo' );
	}
};
