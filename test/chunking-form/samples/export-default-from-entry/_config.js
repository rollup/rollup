module.exports = defineTest({
	description: 'correctly imports the default from an entry point',
	options: {
		input: ['main', 'dep']
	}
});
