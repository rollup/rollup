module.exports = {
	description: 'handles using dependencies with shimmed missing exports as ',
	expectedWarnings: ['SHIMMED_EXPORT'],
	options: {
		input: ['main.js'],
		shimMissingExports: true,
		output: { preserveModules: true }
	}
};
