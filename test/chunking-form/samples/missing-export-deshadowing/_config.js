module.exports = {
	description: 'missing export deshadowing',
	options: {
		input: ['main.js', 'dep.js'],
		shimMissingExports: true
	}
};
