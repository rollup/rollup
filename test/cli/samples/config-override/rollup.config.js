import replace from '@rollup/plugin-replace';

export default {
	input: 'nope.js',
	output: {
		format: 'amd'
	},
	plugins: [
		replace( { preventAssignment: true, 'ANSWER': 42 } )
	]
};
