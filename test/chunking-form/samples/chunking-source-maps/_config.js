module.exports = defineRollupTest({
	description: 'source maps',
	options: {
		input: ['main1.js', 'main2.js'],
		output: {
			sourcemap: true
		}
	}
});
