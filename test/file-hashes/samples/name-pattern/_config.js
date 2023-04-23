module.exports = defineTest({
	description: 'creates different hashes if the name pattern differs',
	options1: {
		input: 'main',
		output: {
			chunkFileNames: '[hash]-[name]'
		}
	},
	options2: {
		input: 'main',
		output: {
			chunkFileNames: '[name]-[hash]'
		}
	}
});
