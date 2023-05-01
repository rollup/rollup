module.exports = defineTest({
	description: 'avoid facades if possible when using manual chunks',
	options: {
		input: ['main1', 'main2'],
		output: {
			manualChunks: {
				manual: ['main2']
			}
		}
	}
});
