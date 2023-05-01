module.exports = defineTest({
	description: 'creates different hashes if the format differs',
	options1: {
		input: 'main',
		output: {
			format: 'es'
		}
	},
	options2: {
		input: 'main',
		output: {
			format: 'cjs'
		}
	}
});
