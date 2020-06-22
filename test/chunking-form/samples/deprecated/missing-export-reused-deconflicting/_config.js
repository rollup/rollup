module.exports = {
	description: 'handles using dependencies with shimmed missing exports as ',
	expectedWarnings: ['SHIMMED_EXPORT'],
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		preserveModules: true,
		shimMissingExports: true
	}
};
