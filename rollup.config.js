import { readFileSync } from 'fs';
import buble from 'rollup-plugin-buble';
import nodeResolve from 'rollup-plugin-node-resolve';
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
	plugins: [
		buble({
			include: [ 'src/**', 'node_modules/acorn/**' ],
			target: {
				node: 4
			}
		}),

		nodeResolve({
			jsnext: true
		}),

		replace({
			include: 'src/rollup.js',
			delimiters: [ '<@', '@>' ],
			sourceMap: true,
			values: { 'VERSION': pkg.version }
		})
	],
	external: [
		'fs',
		'path'
	],
	banner: banner,
	sourceMap: true,
	moduleName: 'rollup',
	targets: [
		{ dest: 'dist/rollup.js', format: 'cjs' },
		{ dest: 'dist/rollup.es.js', format: 'es' }
	]
};
