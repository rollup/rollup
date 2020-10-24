import replace from '@rollup/plugin-replace';

export default {
	input: 'main.js',
	output: {
		format: 'cjs'
	},
	plugins: [
		//@ts-ignore
		replace({ ANSWER: 42 })
	]
};
