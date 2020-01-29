var replace = require( 'rollup-plugin-replace' );

module.exports = {
	input: 'main.js',
	output: {
		format: 'cjs'
	},
	plugins: [
		replace( { 'ANSWER': 42 } )
	]
};
