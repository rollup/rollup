var fs = require( 'fs' );

module.exports = {
	description: 'uses custom loaders, falling back to default',
	options: {
		plugins: [
			{
				load: function ( id ) {
					if ( /foo\.js/.test( id ) ) {
						return fs.readFileSync( id, 'utf-8' ).replace( '@', 1 );
					}
				}
			},
			{
				load: function ( id ) {
					if ( /bar\.js/.test( id ) ) {
						return fs.readFileSync( id, 'utf-8' ).replace( '@', 2 );
					}
				}
			}
		]
	}
};
