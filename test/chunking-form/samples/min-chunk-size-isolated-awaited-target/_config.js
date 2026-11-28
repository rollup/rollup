module.exports = defineTest({
	description: 'does not merge helpers across an isolated awaited target',
	formats: ['es', 'system'],
	expectedWarnings: ['CIRCULAR_DEPENDENCY', 'CIRCULAR_CHUNK'],
	options: {
		input: 'main.js',
		output: { experimentalMinChunkSize: 100 }
	}
});
