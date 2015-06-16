var gobble = require( 'gobble' );

var selfhost = 1;

module.exports = selfhost ?
	gobble( 'src' )
		.transform( 'babel' )
		.transform( 'rollup', {
			entry: 'rollup.js',
			format: 'cjs',
			external: [ 'sander', 'path', 'acorn', 'magic-string' ]
		}) :

	gobble( 'src' )
		.transform( 'babel' )
		.transform( 'esperanto-bundle', {
			entry: 'rollup',
			type: 'cjs',
			strict: true
		});
