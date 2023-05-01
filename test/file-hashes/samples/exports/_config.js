module.exports = defineTest({
	description: 'creates different hashes if the generated exports differ',
	options1: {
		input: ['main1', 'other']
	},
	options2: {
		input: ['main2', 'other']
	}
});
