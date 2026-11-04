module.exports = defineTest({
	description: 'creates different hashes if a debug ID comment is added',
	options1: {
		input: 'main',
		output: {
			sourcemap: 'hidden'
		}
	},
	options2: {
		input: 'main',
		output: {
			sourcemap: 'hidden',
			sourcemapDebugIds: true
		}
	}
});
