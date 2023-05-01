module.exports = defineTest({
	description: 'does not drop indirect reexports when preserving modules',
	expectedWarnings: ['MIXED_EXPORTS'],
	options: {
		output: { name: 'bundle', preserveModules: true }
	}
});
