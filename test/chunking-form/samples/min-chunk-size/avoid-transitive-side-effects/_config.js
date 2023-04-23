module.exports = defineTest({
	description: 'does not merge chunks if a dependency would introduce a new side effect',
	options: {
		input: ['main1.js', 'main2.js', 'main3.js', 'main4.js'],
		output: {
			experimentalMinChunkSize: 100
		}
	}
});
