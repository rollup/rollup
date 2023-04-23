module.exports = defineTest({
	description: 'handles using dependencies with shimmed missing exports as ',
	expectedWarnings: ['SHIMMED_EXPORT', 'DEPRECATED_FEATURE'],
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		preserveModules: true,
		shimMissingExports: true
	}
});
