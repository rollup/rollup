import replace from '@rollup/plugin-replace';

export default {
	input: 'main.js',
	output: {
		format: 'cjs'
	},
	plugins: [
		replace( { preventAssignment: true, ANSWER: 42 } )
	]
};
