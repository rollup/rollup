module.exports = defineTest({
	description: 'does not produce name conflicts when reexporting via default exports',
	options: {
		input: ['main1', 'main2']
	}
});
