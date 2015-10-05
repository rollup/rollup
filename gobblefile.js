var gobble = require( 'gobble' );
var fs = require( 'fs' );

var src = gobble( 'src' );

var node = src
	.transform( 'rollup', {
		entry: 'rollup.js',
		dest: 'rollup.js',
		format: 'cjs',
		external: [ 'fs' ],
		sourceMap: true
	})
	.transform( 'babel' );

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
		load: function ( id ) {
			if ( ~id.indexOf( 'fs.js' ) ) return browserPlaceholders.fs;
			if ( ~id.indexOf( 'es6-promise' ) ) return browserPlaceholders.promise;
			return fs.readFileSync( id ).toString();
		}
	});

module.exports = gobble([ node, browser ]);
