module.exports = defineRollupTest({
	description: 'chunk variable name conflict',
	options: {
		input: ['main1.js', 'main2.js']
	}
});
