module.exports = {
	description: 'missing export + preserve modules + import default expression',
	options: {
		input: ['main.js'],
		shimMissingExports: true,
		experimentalPreserveModules: true
	}
};
