module.exports = defineTest({
	description: 'avoids circular dependencies when merging chunks',
	options: {
		input: ['main1.js', 'main2.js', 'main3.js'],
		output: {
			experimentalMinChunkSize: 100
		}
	}
});
