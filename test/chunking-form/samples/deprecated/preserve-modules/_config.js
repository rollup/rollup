module.exports = defineTest({
	description: 'Rewrite modules in-place',
	options: {
		strictDeprecations: false,
		input: ['main1.js', 'main2.js'],
		preserveModules: true
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
