var gobble = require( 'gobble' );

var selfhost = 0;

module.exports = selfhost ?
	gobble( 'src' )
		.transform( 'babel' )
		.transform( 'rollup', {
			entry: 'rollup',
			format: 'cjs'
		}) :

	gobble( 'src' )
		.transform( 'babel' )
		.transform( 'esperanto-bundle', {
			entry: 'rollup',
			type: 'cjs',
			strict: true
		});
