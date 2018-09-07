var replace = require( 'rollup-plugin-replace' );

let warnings = [];

module.exports = {
	entry: 'main.js',
	input: 'main.js',
	format: 'esm',
	dest: '_actual/bundle1.js',
	output: {
		file: '_actual/bundle2.js',
		format: 'esm'
	},
	plugins: [
		replace( { 'ANSWER': 42 } )
	]
};
