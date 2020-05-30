var replace = require( '@rollup/plugin-replace' );

module.exports = {
	input: {
		first: 'first',
		second: 'second',
		third: 'third'
	},
	output: {
		format: 'es',
		dir: '_actual'
	}
};
