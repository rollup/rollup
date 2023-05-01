module.exports = defineTest({
	description: 'does not merge chunks if all chunks are below the size limit',
	options: {
		input: ['main1.js', 'main2.js', 'main3.js'],
		output: {
			experimentalMinChunkSize: 1
		}
	}
});
