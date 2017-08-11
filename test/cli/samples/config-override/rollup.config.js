import replace from 'rollup-plugin-replace';

export default {
	entry: 'nope.js',
	format: 'amd',
	plugins: [
		replace({ 'ANSWER': 42 })
	]
};
