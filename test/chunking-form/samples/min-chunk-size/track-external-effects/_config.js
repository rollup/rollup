module.exports = defineTest({
	description: 'tracks external imports as side effects',
	options: {
		input: ['main1.js', 'main2.js'],
		external: ['external1', 'external2'],
		output: {
			experimentalMinChunkSize: 100
		}
	}
});
