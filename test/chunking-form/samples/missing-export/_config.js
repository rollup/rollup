module.exports = defineTest({
	description: 'missing export',
	expectedWarnings: ['SHIMMED_EXPORT', 'MIXED_EXPORTS'],
	options: {
		input: ['main.js', 'dep.js'],
		shimMissingExports: true
	}
});
