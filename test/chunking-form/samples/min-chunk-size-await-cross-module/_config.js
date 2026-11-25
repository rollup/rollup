module.exports = defineTest({
	description: 'does not merge helpers across a chunk suspended by another module',
	formats: ['es', 'system'],
	options: {
		input: 'main.js',
		output: { experimentalMinChunkSize: 100 }
	}
});
