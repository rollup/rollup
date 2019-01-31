import replace from 'rollup-plugin-replace';

export const ignoresNonDefaultExports = true

export default {
	input: 'main.js',
	output: {
		format: 'cjs'
	},
	plugins: [
		replace( { 'ANSWER': 42 } )
	]
};
