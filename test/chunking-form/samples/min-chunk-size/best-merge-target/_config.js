module.exports = defineTest({
	description: 'uses the merge target that is closest',
	options: {
		input: [
			'main1.js',
			'main2.js',
			'main3.js',
			'main4.js',
			'main5.js',
			'main6.js',
			'main7.js',
			'main8.js',
			'main9.js'
		],
		output: {
			experimentalMinChunkSize: 100
		}
	}
});
