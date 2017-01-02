var path = require( 'path' );
var assert = require( 'assert' );

module.exports = {
	description: 'reports which file caused a transform error',
	options: {
		plugins: [{
			name: 'bad-plugin',
			transform: function ( code, id ) {
				if ( /foo/.test( id ) ) {
					throw new Error( 'nope' );
				}
			}
		}]
	},
	error: {
		code: 'BAD_TRANSFORMER',
		message: `Error transforming foo.js with 'bad-plugin' plugin: nope`,
		plugin: 'bad-plugin',
		id: path.resolve( __dirname, 'foo.js' )
	}
};
