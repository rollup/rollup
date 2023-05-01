module.exports = defineTest({
	description:
		'correctly resolves imports via a proxy module as direct imports when preserving modules',
	options: {
		strictDeprecations: false,
		preserveModules: true,
		external: 'external'
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
