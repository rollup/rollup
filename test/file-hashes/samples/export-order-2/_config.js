module.exports = defineTest({
	description: 'creates different hashes if different variables are exported under the same name',
	options1: {
		input: ['main1', 'dep']
	},
	options2: {
		input: ['main2', 'dep']
	}
});
