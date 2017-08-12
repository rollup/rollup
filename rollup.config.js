import { readFileSync } from 'fs';
import buble from 'rollup-plugin-buble';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

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
	entry: 'src/node-entry.js',
	plugins: [
		json(),

		buble({
			include: [ 'src/**', 'node_modules/acorn/**' ],
			target: {
				node: '0.12'
			}
		}),

		nodeResolve({
			jsnext: true
		}),

		commonjs()
	],
	external: [
		'fs',
		'path',
		'events',
		'module'
	],
	banner,
	sourceMap: true,
	moduleName: 'rollup',
	targets: [
		{ dest: 'dist/rollup.js', format: 'cjs' },
		{ dest: 'dist/rollup.es.js', format: 'es' }
	]
};
