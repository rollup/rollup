module.exports = defineTest({
	description: 'merges dynamic imports even when the entry has side effects',
	options: {
		input: ['main.js'],
		output: {
			experimentalMinChunkSize: 100
		}
	}
});
