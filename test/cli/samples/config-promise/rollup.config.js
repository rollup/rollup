import replace from '@rollup/plugin-replace';

export const ignored = 'forces named exports mode';

export default Promise.resolve({
	input: 'main.js',
	output: {
		format: 'cjs'
	},
	plugins: [replace({ ANSWER: 42 })]
});
