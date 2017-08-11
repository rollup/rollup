var replace = require( 'rollup-plugin-replace' );

module.exports = {
	entry: 'main.js',
	format: 'cjs',
	plugins: [
		replace({ 'ANSWER': 42 })
	]
};
