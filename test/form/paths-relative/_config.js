const { resolve } = require( 'path' );

const resolved = resolve( __dirname, 'foo.js' );

module.exports = {
	description: 'external paths (#754)',
	options: {
		external: [ resolved ],
		paths: {
			[ resolved ]: '../foo'
		}
	}
};
