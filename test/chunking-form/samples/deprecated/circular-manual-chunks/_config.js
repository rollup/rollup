module.exports = defineTest({
	description: 'handles manual chunks with circular dependencies',
	expectedWarnings: ['CIRCULAR_DEPENDENCY', 'DEPRECATED_FEATURE'],
	options: {
		strictDeprecations: false,
		input: 'main',
		manualChunks: { lib1: ['lib1'], lib2: ['lib2'] }
	}
});
