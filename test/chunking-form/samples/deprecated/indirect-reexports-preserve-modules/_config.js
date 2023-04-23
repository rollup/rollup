module.exports = defineTest({
	description: 'does not drop indirect reexports when preserving modules',
	expectedWarnings: ['MIXED_EXPORTS', 'DEPRECATED_FEATURE'],
	options: {
		strictDeprecations: false,
		output: { name: 'bundle' },
		preserveModules: true
	}
});
