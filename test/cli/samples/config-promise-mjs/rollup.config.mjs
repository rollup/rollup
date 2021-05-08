import replace from '@rollup/plugin-replace';

export default Promise.resolve({
	input: 'main.js',
	output: {
		format: 'cjs'
	},
	plugins: [replace({ preventAssignment: true, ANSWER: 42 })]
});
