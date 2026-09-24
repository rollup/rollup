module.exports = defineTest({
	description:
		'in explicit mode, manual chunks contain only their explicit modules and all dependencies are extracted into separate chunks',
	options: {
		input: ['main.js', 'main2.js'],
		output: {
			onlyExplicitManualChunks: true,
			manualChunks: {
				manual: ['m.js']
			}
		}
	}
});
