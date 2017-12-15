var assert = require( 'assert' );
var path = require( 'path' );

module.exports = {
	description: 'includes an external module included dynamically by an alias',
	options: {
		input: path.join( __dirname, 'first', 'main.js' ),
		external: function ( id, parentId, isResolved ) {
			if ( isResolved === false || !parentId )
				return false;
			if ( parentId.endsWith( 'main.js' ) ) {
				return id === 'lodash';
			} else {
				return id === 'underscore';
			}
		},

		// Define a simple alias plugin for underscore
		plugins: [
			{
				resolveId: function ( id, parentId ) {
					if ( id === 'underscore' && parentId && parentId.endsWith( 'main.js' ) ) {
						return 'lodash';
					}
				}
			}
		]
	},

	context: {
		require: function ( required ) {
			assert( required === 'lodash' || required === 'underscore' );
			return 1;
		}
	}
};
