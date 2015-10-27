import { readFileSync } from 'fs';
import babel from 'rollup-plugin-babel';
import npm from 'rollup-plugin-npm';
import replace from 'rollup-plugin-replace';

var pkg = JSON.parse( readFileSync( 'package.json', 'utf-8' ) );

var commitHash = (function () {
	try {
		return readFileSync( '.commithash', 'utf-8' );
	} catch ( err ) {
		return 'unknown';
	}
})();

var banner = readFileSync( 'src/banner.js', 'utf-8' )
	.replace( '${version}', pkg.version )
	.replace( '${time}', new Date() )
	.replace( '${commitHash}', commitHash );

export default {
	entry: 'src/rollup.js',
	format: 'cjs',
	plugins: [
		babel({
			include: [ 'src/**', 'node_modules/acorn/**' ]
		}),

		npm({
			jsnext: true
		}),

		replace({
			include: 'src/rollup.js',
			delimiters: [ '<@', '@>' ],
			sourceMap: true,
			values: { 'VERSION': pkg.version }
		})
	],
	external: [ 'fs' ],
	banner: banner,
	sourceMap: true,
	moduleName: 'rollup'
};
