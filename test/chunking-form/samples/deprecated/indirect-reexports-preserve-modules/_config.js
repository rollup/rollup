module.exports = {
	description: 'does not drop indirect reexports when preserving modules',
	expectedWarnings: ['MIXED_EXPORTS'],
	options: {
		strictDeprecations: false,
		output: { name: 'bundle' },
		preserveModules: true
	}
};
