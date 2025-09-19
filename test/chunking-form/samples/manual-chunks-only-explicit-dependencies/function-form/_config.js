module.exports = defineTest({
	description:
		'manual chunks function form with onlyExplicitManualChunks does not merge non specified dependencies into the output chunk. Instead it lets Rollup normal chunking logic output them separately.',
	options: {
		input: 'main',
		output: {
			manualChunks: id => {
				if (id.endsWith('manual1.js') || id.endsWith('manual2.js')) {
					return 'manual';
				}
			},
			onlyExplicitManualChunks: true
		}
	}
});
