var gobble = require( 'gobble' );
var fs = require( 'fs' );

var version = require( './package.json' ).version;

var banner = fs.readFileSync( 'src/banner.js' ).toString()
	.replace( '${version}', version )
	.replace( '${time}', new Date() )
	.replace( '${commitHash}', process.env.COMMIT_HASH || 'unknown' );

var src = gobble( 'src' );

var node = src
	.transform( 'rollup-babel', {
		entry: 'rollup.js',
		dest: 'rollup.js',
		format: 'cjs',
		external: [ 'fs' ],
		sourceMap: true,
		banner: banner,
		load: function ( id ) {
			if ( ~id.indexOf( 'rollup.js' ) ) {
				return fs.readFileSync( 'src/rollup.js', 'utf-8' ).replace( /<@VERSION@>/, version );
			}
		}
	});

var browserPlaceholders = {
	fs: fs.readFileSync( 'browser/fs.js' ).toString(),
	promise: fs.readFileSync( 'browser/promise.js' ).toString()
};

var browser = src
	.transform( 'rollup-babel', {
		entry: 'rollup.js',
		dest: 'rollup.browser.js',
		format: 'umd',
		moduleName: 'rollup',
		sourceMap: true,
		banner: banner,
		load: function ( id ) {
			if ( ~id.indexOf( 'rollup.js' ) ) {
				return fs.readFileSync( 'src/rollup.js', 'utf-8' ).replace( /<@VERSION@>/, version );
			}
			if ( ~id.indexOf( 'fs.js' ) ) return browserPlaceholders.fs;
			if ( ~id.indexOf( 'es6-promise' ) ) return browserPlaceholders.promise;
		}
	});

module.exports = gobble([ node, browser ]);
