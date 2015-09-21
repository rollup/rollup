var gobble = require( 'gobble' );
var fs = require( 'fs' );

var src = gobble( 'src' );

var node = src
	.transform( 'rollup', {
		entry: 'rollup.js',
		dest: 'rollup.js',
		format: 'cjs',
		external: [ 'sander', 'acorn' ]
	})
	.transform( 'babel' );

var browserPlaceholders = {
	sander: fs.readFileSync( 'browser/sander.js' ).toString()
};

var browser = src
	.transform( 'rollup-babel', {
		entry: 'rollup.js',
		dest: 'rollup.browser.js',
		format: 'cjs',
		load: function ( id ) {
			if ( ~id.indexOf( 'sander.js' ) ) return browserPlaceholders.sander;
			return fs.readFileSync( id ).toString();
		},
		external: [ 'acorn' ]
	})
	.transform( 'browserify', {
		entries: [ './rollup.browser' ],
		dest: 'rollup.browser.js',
		standalone: 'rollup'
	});

module.exports = gobble([ node, browser ]);
