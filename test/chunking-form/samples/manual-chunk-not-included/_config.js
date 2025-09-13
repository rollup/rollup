module.exports = defineTest({
	description:
		'does not output a bundle for the manual chunks that are not part of the module graph',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				manual: ['manual-entry.js']
			}
		}
	}
});
