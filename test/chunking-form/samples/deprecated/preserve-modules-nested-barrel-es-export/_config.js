module.exports = defineTest({
	description: 'confirm exports are deconflicted when exporting nested index aliases',
	options: {
		strictDeprecations: false,
		input: 'main.js',
		preserveModules: true
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
