module.exports = defineTest({
	description: 'does not merge small chunks that have side effects',
	options: {
		input: ['main1.js', 'main2.js', 'main3.js'],
		output: {
			experimentalMinChunkSize: 100
		}
	}
});
