module.exports = defineTest({
	description: 'source maps',
	options: {
		input: ['main1.js', 'main2.js'],
		output: {
			sourcemap: true
		}
	}
});
