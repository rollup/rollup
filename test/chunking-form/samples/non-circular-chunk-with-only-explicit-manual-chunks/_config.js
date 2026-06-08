module.exports = defineTest({
	description: 'Does not produce circular chunk with onlyExplicitManualChunks',
	options: {
		output: {
			manualChunks(id) {
				if (id.includes('c.js')) return 'c';
				if (id.includes('c3.js')) return 'c3';
			},
			onlyExplicitManualChunks: true
		}
	}
});
