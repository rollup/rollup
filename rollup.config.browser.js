import config from './rollup.config.js';

config.plugins.push({
	load: function ( id ) {
		if ( ~id.indexOf( 'fs.js' ) ) return readFileSync( 'browser/fs.js' ).toString();
		if ( ~id.indexOf( 'es6-promise' ) ) return readFileSync( 'browser/promise.js' ).toString();
	}
});

config.format = 'umd';

export default config;
