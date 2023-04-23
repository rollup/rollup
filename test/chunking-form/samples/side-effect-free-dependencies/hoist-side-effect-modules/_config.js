module.exports = defineTest({
	description: 'hoist side-effect imports when avoiding empty imports',
	options: {
		input: ['main1', 'main2', 'main3']
	},
	expectedWarnings: ['CIRCULAR_DEPENDENCY']
});
