module.exports = defineTest({
	description: 'preserves awaited edges when the awaited target merges before another merge',
	formats: ['es', 'system'],
	expectedWarnings: ['CIRCULAR_DEPENDENCY'],
	options: {
		input: ['main.js', 'awaited.js', 'other.js'],
		output: { experimentalMinChunkSize: 1000 }
	}
});
