module.exports = defineTest({
	description: 'dynamic imports are handled correctly when preserving modules',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		preserveModules: true
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
