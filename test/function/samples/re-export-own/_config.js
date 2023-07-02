module.exports = {
	description: 'avoid using export.hasOwnProperty',
	options: {
		input: './main.js',
		output: {
			paths: {
				external: './external.js'
			},
			format: 'cjs'
		}
	}
};
