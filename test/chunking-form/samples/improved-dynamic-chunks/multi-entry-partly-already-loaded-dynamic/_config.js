module.exports = defineTest({
	description:
		'avoids chunks for always loaded dependencies if multiple entry points with different dependencies have dynamic imports',
	options: {
		input: ['main1', 'main2']
	}
});
