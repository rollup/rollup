var gobble = require( 'gobble' );

module.exports = gobble( 'src' )
	.transform( 'babel' )
	.transform( 'esperanto-bundle', {
		entry: 'rollup',
		type: 'cjs',
		strict: true
	});