module.exports = defineTest({
	description: 'treats unrelated files in manual chunks as one file',
	options: {
		input: ['main1.js', 'main2.js'],
		output: {
			manualChunks(id) {
				if (/manual\d/.test(id)) {
					return 'manual';
				}
			},
			onlyExplicitManualChunks: true
		}
	}
});
