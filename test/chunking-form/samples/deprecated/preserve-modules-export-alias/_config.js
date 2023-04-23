module.exports = defineRollupTest({
	description: 'confirm export aliases are preserved in modules',
	options: {
		strictDeprecations: false,
		input: ['main1.js', 'main2.js'],
		preserveModules: true
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
