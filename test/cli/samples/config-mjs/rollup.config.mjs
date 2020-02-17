import replace from '@rollup/plugin-replace';

export default {
	input: 'main.js',
	output: {
		format: 'cjs'
	},
	plugins: [
		replace( { ANSWER: 42 } )
	]
};
