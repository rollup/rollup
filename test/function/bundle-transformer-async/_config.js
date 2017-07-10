module.exports = {
	description: 'bundle transformers can be asynchronous',
	options: {
		plugins: [
			{
				transformBundle: function ( code ) {
					return Promise.resolve( code.replace( 'x', 1 ) );
				}
			},
			{
				transformBundle: function ( code ) {
					return code.replace( '1', 2 );
				}
			},
			{
				transformBundle: function ( code ) {
					return Promise.resolve( code.replace( '2', 3 ) );
				}
			}
		]
	}
};
