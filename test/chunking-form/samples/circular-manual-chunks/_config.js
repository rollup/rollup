module.exports = defineTest({
	description: 'handles manual chunks with circular dependencies',
	expectedWarnings: ['CIRCULAR_DEPENDENCY'],
	options: {
		input: 'main',
		output: { manualChunks: { lib1: ['lib1'], lib2: ['lib2'] } }
	}
});
