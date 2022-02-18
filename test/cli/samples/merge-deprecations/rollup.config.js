var replace = require('@rollup/plugin-replace');

module.exports = {
	entry: 'main.js',
	input: 'main.js',
	format: 'es',
	dest: '_actual/bundle1.js',
	output: {
		file: '_actual/bundle2.js',
		format: 'es'
	},
	plugins: [replace({ preventAssignment: true, ANSWER: 42 })]
};
