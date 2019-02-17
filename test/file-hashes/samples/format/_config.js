module.exports = {
	description: 'creates different hashes if the format differs',
	options1: {
		input: 'main',
		output: {
			format: 'esm'
		}
	},
	options2: {
		input: 'main',
		output: {
			format: 'cjs'
		}
	}
};
