module.exports = defineTest({
	description: 'does not merge helpers across a forwarded awaited loader',
	formats: ['es', 'system'],
	options: {
		input: 'main.js',
		output: { experimentalMinChunkSize: 100 }
	}
});
