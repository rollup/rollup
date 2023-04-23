module.exports = defineRollupTest({
	description: 'system exports should wrap pure annotations',
	options: {
		input: ['main1.js', 'main2.js']
	}
});
