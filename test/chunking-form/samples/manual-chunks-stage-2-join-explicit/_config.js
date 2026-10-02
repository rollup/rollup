module.exports = defineTest({
	description:
		'in explicit mode, modules that would only join the manual chunk after dynamic entry removal stay in separate chunks',
	options: {
		input: ['main.js'],
		output: {
			onlyExplicitManualChunks: true,
			manualChunks: {
				manual: ['m.js']
			}
		}
	}
});
