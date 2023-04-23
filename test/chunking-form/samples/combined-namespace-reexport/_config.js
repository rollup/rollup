module.exports = defineRollupTest({
	description: 'correctly handles combined namespace reexports',
	options: {
		input: ['main1', 'main2']
	}
});
