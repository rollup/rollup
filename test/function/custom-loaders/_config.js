var fs = require( 'fs' );

module.exports = {
	description: 'uses custom loaders, falling back to default',
	options: {
		load: [
			function ( id ) {
				if ( /foo\.js/.test( id ) ) {
					return fs.readFileSync( id, 'utf-8' ).replace( '@', 1 );
				}
			},
			function ( id ) {
				if ( /bar\.js/.test( id ) ) {
					return fs.readFileSync( id, 'utf-8' ).replace( '@', 2 );
				}
			}
		]
	}
};
