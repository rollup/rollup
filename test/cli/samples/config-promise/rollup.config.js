var replace = require( 'rollup-plugin-replace' );

module.exports = Promise.resolve({
	input: 'main.js',
	format: 'cjs',
	plugins: [
		replace({ 'ANSWER': 42 })
	]
});
