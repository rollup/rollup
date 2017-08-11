import { readFileSync } from 'fs';
import config from './rollup.config.js';

config.plugins.push({
	load: function ( id ) {
		if ( ~id.indexOf( 'fs.js' ) ) return readFileSync( 'browser/fs.js', 'utf-8' );
		if ( ~id.indexOf( 'path.js' ) ) return readFileSync( 'browser/path.js', 'utf-8' );
	}
});

config.entry = 'src/browser-entry.js';
config.format = 'umd';
config.dest = 'dist/rollup.browser.js';

export default config;
