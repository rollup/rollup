var gobble = require( 'gobble' );
var fs = require( 'fs' );

var src = gobble( 'src' );

var node = src
	.transform( 'rollup', {
		entry: 'rollup.js',
		dest: 'rollup.js',
		format: 'cjs',
		external: [ 'sander', 'path', 'acorn', 'magic-string' ]
	})
	.transform( 'babel' );

var absolutePath = /^(?:\/|(?:[A-Za-z]:)?\\)/;

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
		external: [ 'acorn', 'magic-string' ]
	})
	.transform( 'browserify', {
		entries: [ './rollup.browser' ],
		dest: 'rollup.browser.js',
		standalone: 'rollup'
	});

module.exports = gobble([ node, browser ]);
