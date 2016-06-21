import { readFileSync } from 'fs';
import config from './rollup.config.js';

config.plugins.push({
	load: function ( id ) {
		if ( ~id.indexOf( 'fs.js' ) ) return readFileSync( 'browser/fs.js' ).toString();
	}
});

config.format = 'umd';

export default config;
