module.exports = {
	description: 'avoid facades if possible when using manual chunks',
	options: {
		input: ['main1', 'main2'],
		manualChunks: {
			manual: ['main2']
		}
	}
};
