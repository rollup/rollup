module.exports = defineTest({
	description: 'confirm exports are preserved when exporting a module',
	options: {
		strictDeprecations: false,
		input: 'main.js',
		preserveModules: true
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
