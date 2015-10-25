var assert = require( 'assert' );

module.exports = {
	description: 'resolver error is not caught',
	options: {
		plugins: [
			{
				resolveId: function () {
					throw new Error( 'nope' );
				},
				load: function ( id ) {
					if ( id === 'main' ) return 'assert.ok( false );'
				}
			},
			{
				resolveId: function ( importee, importer ) {
					return 'main';
				}
			}
		]
	},
	error: function ( err ) {
		assert.equal( err.message, 'nope' );
	}
};
