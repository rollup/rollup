module.exports = {
	description: 'handles using dependencies with shimmed missing exports as ',
	options: {
		input: ['main.js'],
		experimentalPreserveModules: true,
		shimMissingExports: true
	}
};
