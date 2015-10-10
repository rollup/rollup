var assert = require( 'assert' );

module.exports = {
	description: 'resolver error is not caught',
	options: {
		resolveId: [
			function () {
				throw new Error( 'nope' );
			},
			function ( importee, importer ) {
				return 'main';
			}
		],
		load: function ( id ) {
			if ( id === 'main' ) return 'assert.ok( false );'
		}
	},
	error: function ( err ) {
		assert.equal( err.message, 'nope' );
	}
};
