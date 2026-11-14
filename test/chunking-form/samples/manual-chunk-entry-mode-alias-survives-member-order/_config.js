module.exports = defineTest({
	description:
		'in entry mode, the manual chunk keeps its name even when a co-loaded non-member is imported before the member',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				vendor: ['manual.js']
			}
		}
	}
});
