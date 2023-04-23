module.exports = defineTest({
	description: 'single entry names file correctly',
	options: {
		strictDeprecations: false,
		input: 'main.js',
		preserveModules: true
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
