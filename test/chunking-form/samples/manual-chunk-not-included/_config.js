module.exports = defineTest({
	description: 'handles manual chunks where the root is not part of the module graph',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				manual: ['manual-entry.js']
			}
		}
	}
});
