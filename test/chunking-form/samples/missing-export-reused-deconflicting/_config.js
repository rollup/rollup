module.exports = {
	description: 'handles using dependencies with shimmed missing exports as ',
	options: {
		input: ['main.js'],
		preserveModules: true,
		shimMissingExports: true
	}
};
