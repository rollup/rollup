module.exports = defineTest({
	description:
		'manual chunks stay in place when the experimentalMinChunkSize merging would otherwise merge them away or make them merge targets',
	options: {
		input: ['main.js'],
		output: {
			experimentalMinChunkSize: 1000,
			manualChunks: {
				manual: ['m.js']
			}
		}
	}
});
