var assert = require( 'assert' );
var path = require( 'path' );

module.exports = {
	description: 'includes an external module included dynamically by an alias',
	options: {
		entry: path.join( __dirname, 'first', 'main.js' ),
		external: [ 'lodash' ],

		// Define a simple alias plugin for underscore
		plugins: [
			{
				resolveId: function ( id ) {
					if ( id === 'underscore' ) {
						return 'lodash';
					}
				}
			}
		]
	},

	context: {
		require: function ( required ) {
			assert.equal( required, 'lodash' );
			return 1;
		}
	}
};
