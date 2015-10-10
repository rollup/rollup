var path = require( 'path' );
var assert = require( 'assert' );

module.exports = {
	description: 'uses custom path resolvers (plural)',
	options: {
		resolveId: [
			function ( importee ) {
				if ( importee[0] === '@' )
					return path.resolve( __dirname, 'globals-' + importee.slice( 1 ).toLowerCase() + '.js' );
			},
			function ( importee ) {
				if ( importee[0] === '!' ) return '<empty>';
			}
		],
		load: function ( id ) {
			if ( id === '<empty>' ) return '';
		}
	},
	exports: function ( exports ) {
		assert.strictEqual( exports.res, 0 );
	}
};
