import replace from '@rollup/plugin-replace';

export const ignoresNonDefaultExports = true;

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
