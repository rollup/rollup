module.exports = defineTest({
	description: 'marks the "output.experimentalDeepDynamicChunkOptimization" option as deprecated',
	options: {
		output: {
			experimentalDeepDynamicChunkOptimization: true
		}
	},
	generateError: {
		code: 'DEPRECATED_FEATURE',
		message:
			'The "output.experimentalDeepDynamicChunkOptimization" option is deprecated as Rollup always runs the full chunking algorithm now. The option should be removed.',
		url: 'https://rollupjs.org/configuration-options/#output-experimentaldeepdynamicchunkoptimization'
	}
});
