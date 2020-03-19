const replace = require('@rollup/plugin-replace');

module.exports = Promise.resolve({
	input: 'main.js',
	output: {
		format: 'cjs'
	},
	plugins: [replace({ ANSWER: 42 })]
});
