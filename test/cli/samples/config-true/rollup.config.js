import replace from 'rollup-plugin-replace';

export default {
	input: 'main.js',
	format: 'cjs',
	plugins: [
		replace({ 'ANSWER': 42 })
	]
};
