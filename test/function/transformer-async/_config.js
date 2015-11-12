var Promise = require( 'es6-promise' ).Promise;

module.exports = {
	description: 'transformers can be asynchronous',
	options: {
		plugins: [
			{
				transform: function ( code ) {
					return Promise.resolve( code.replace( 'x', 1 ) );
				}
			},
			{
				transform: function ( code ) {
					return code.replace( '1', 2 );
				}
			},
			{
				transform: function ( code ) {
					return Promise.resolve( code.replace( '2', 3 ) );
				}
			}
		]
	}
};
