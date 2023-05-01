module.exports = defineTest({
	description: 'ignores correlated side effects if they cannot be merged',
	options: {
		input: ['main1.js', 'main2.js', 'main3.js', 'main4.js', 'main5.js'],
		output: {
			experimentalMinChunkSize: 100
		}
	}
});
