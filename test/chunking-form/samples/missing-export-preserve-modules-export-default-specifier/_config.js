module.exports = {
	description: 'missing export + preserve modules + export default specifier',
	options: {
		input: ['main.js'],
		shimMissingExports: true,
		experimentalPreserveModules: true
	}
};
