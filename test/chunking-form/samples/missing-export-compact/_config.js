module.exports = {
	description: 'missing export compact',
	options: {
		input: ['main.js', 'dep.js'],
		shimMissingExports: true,
		output: {
			compact: true
		}
	}
};
