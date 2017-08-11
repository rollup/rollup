import replace from 'rollup-plugin-replace';

export default {
	entry: 'main.js',
	format: 'cjs',
	plugins: [
		replace({ 'ANSWER': 42 })
	]
};
