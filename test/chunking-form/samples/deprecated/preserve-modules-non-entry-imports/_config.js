module.exports = defineTest({
	description: 'imports and exports of non-entry points are tracked',
	options: {
		strictDeprecations: false,
		input: 'main.js',
		preserveModules: true
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
