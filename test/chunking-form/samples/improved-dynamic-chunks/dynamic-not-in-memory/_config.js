module.exports = defineTest({
	description: 'keeps chunks separate when not in memory for all dynamic imports',
	options: {
		input: ['main1', 'main2', 'main3']
	}
});
