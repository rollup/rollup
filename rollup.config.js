import { readFileSync } from 'fs';
import babel from 'rollup-plugins-babel';
import replace from 'rollup-plugins-replace';

var pkg = JSON.parse( readFileSync( 'package.json', 'utf-8' ) );
var version = JSON.parse( pkg.version );
var commitHash = (function () {
	try {
		return readFileSync( '.commithash', 'utf-8' );
	} catch ( err ) {
		return 'unknown';
	}
})();

var banner = readFileSync( 'src/banner.js', 'utf-8' )
	.replace( '${version}', version )
	.replace( '${time}', new Date() )
	.replace( '${commitHash}', commitHash );

export default {
	entry: 'src/rollup.js',
	format: 'cjs',
	plugins: [
		babel(),
		replace({
			'VERSION': pkg.version
		})
	],
	external: [ 'fs' ],
	banner: banner,
	sourceMap: true
};
