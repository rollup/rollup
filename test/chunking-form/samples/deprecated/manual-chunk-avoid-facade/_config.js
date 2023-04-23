module.exports = defineTest({
	description: 'avoid facades if possible when using manual chunks',
	options: {
		strictDeprecations: false,
		input: ['main1', 'main2'],
		manualChunks: {
			manual: ['main2']
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
