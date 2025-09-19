module.exports = defineTest({
	description:
		"manual chunks object form merges the specified modules' dependencies into the output chunk",
	options: {
		input: 'main',
		output: {
			manualChunks: {
				manual: ['manual1', 'manual2']
			},
			onlyExplicitManualChunks: true
		}
	}
});
