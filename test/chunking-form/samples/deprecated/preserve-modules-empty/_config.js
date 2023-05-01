module.exports = defineTest({
	description: 'Preserve modules remove empty dependencies',
	options: {
		strictDeprecations: false,
		input: 'main.js',
		preserveModules: true
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
