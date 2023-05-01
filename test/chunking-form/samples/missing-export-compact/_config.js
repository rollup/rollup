module.exports = defineTest({
	description: 'missing export compact',
	expectedWarnings: ['SHIMMED_EXPORT'],
	options: {
		input: ['main.js', 'dep.js'],
		shimMissingExports: true,
		output: {
			compact: true
		}
	}
});
