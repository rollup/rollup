module.exports = defineTest({
	description:
		'do not import variables that reference an original if the original is already imported',
	options: {
		input: ['main1', 'main2']
	}
});
