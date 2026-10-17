module.exports = defineTest({
	description: 'does not merge a dynamic entry depending on a manual chunk into its importer',
	options: {
		input: 'main.js',
		output: {
			manualChunks: {
				manual: ['manual.js']
			}
		}
	}
});
