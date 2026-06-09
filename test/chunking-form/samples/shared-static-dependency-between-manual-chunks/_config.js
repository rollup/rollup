module.exports = defineTest({
	description: 'extracts shared static dependency between manual chunks into a single chunk',
	options: {
		output: {
			manualChunks(id) {
				if (id.includes('manual1.js')) return 'manual1';
				if (id.includes('manual2.js')) return 'manual2';
			},
			onlyExplicitManualChunks: true
		}
	}
});
