var replace = require( 'rollup-plugin-replace' );

module.exports = {
	input: 'main.js',
	format: 'cjs',
	plugins: [
		replace({ 'ANSWER': 42 })
	]
};
