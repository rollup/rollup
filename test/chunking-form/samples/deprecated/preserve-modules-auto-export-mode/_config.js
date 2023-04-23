module.exports = defineTest({
	description: 'Uses entry point semantics for all files when preserving modules',
	options: {
		strictDeprecations: false,
		input: 'main.js',
		preserveModules: true
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
