module.exports = defineTest({
	description: 'handles dynamic imports in manual chunks',
	options: {
		input: 'main.js',
		output: {
			manualChunks: {
				manual: ['manual.js']
			}
		}
	}
});
