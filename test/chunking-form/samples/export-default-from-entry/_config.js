module.exports = defineRollupTest({
	description: 'correctly imports the default from an entry point',
	options: {
		input: ['main', 'dep']
	}
});
