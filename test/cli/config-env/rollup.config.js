var replace = require( 'rollup-plugin-replace' );

module.exports = {
	entry: 'main.js',
	format: 'cjs',
	plugins: [
		replace({
			__ENVIRONMENT__: process.env.PRODUCTION ? 'production' : 'development',
			__FOO__: process.env.FOO
		})
	]
};
