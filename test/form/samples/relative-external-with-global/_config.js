const { resolve } = require( 'path' );

const throttle = resolve( __dirname, 'lib/throttle.js' );

module.exports = {
	description: 'applies globals to externalised relative imports',
	options: {
		external: [ throttle ],
		globals: {
			[ throttle ]: 'Lib.throttle'
		}
	}
};
