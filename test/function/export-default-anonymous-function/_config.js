var fs = require( 'fs' );
var path = require( 'path' );

module.exports = {
	description: 'exports an anonymous function with custom ID resolver', // yeah, this is a real edge case
	options: {
		resolveId: function ( importee, importer ) {
			return path.basename( importee ).replace( /\..+/, '' );
		},
		load: function ( id ) {
			console.log( 'id', id )
			return fs.readFileSync( path.join( __dirname, id + '.js' ), 'utf-8' );
		}
	}
};
