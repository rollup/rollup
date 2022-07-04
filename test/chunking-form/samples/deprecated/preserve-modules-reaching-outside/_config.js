module.exports = {
	description: 'change the module destination',
	options: {
		strictDeprecations: false,
		input: 'src/lib/main.js',
		preserveModules: true
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
};
