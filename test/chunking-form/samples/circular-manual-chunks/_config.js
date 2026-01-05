module.exports = defineTest({
	description: 'handles manual chunks with circular dependencies',
	expectedWarnings: ['CIRCULAR_DEPENDENCY', 'CIRCULAR_CHUNK'],
	options: {
		input: 'main',
		output: { manualChunks: { lib1: ['lib1'], lib2: ['lib2'] } }
	}
});
