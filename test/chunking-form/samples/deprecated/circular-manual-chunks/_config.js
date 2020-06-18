module.exports = {
	description: 'handles manual chunks with circular dependencies',
	expectedWarnings: ['CIRCULAR_DEPENDENCY'],
	options: {
		strictDeprecations: false,
		input: 'main',
		manualChunks: { lib1: ['lib1'], lib2: ['lib2'] }
	}
};
