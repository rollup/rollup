module.exports = defineTest({
	description: 'creates different hashes if a source map comment is added',
	options1: {
		input: 'main'
	},
	options2: {
		input: 'main',
		output: {
			sourcemap: true
		}
	}
});
