module.exports = defineTest({
	description: 'entryFileNames pattern supported in combination with preserveModules',
	options: {
		strictDeprecations: false,
		input: 'src/main.ts',
		output: {
			entryFileNames: '[name]-[format]-[hash].js'
		},
		preserveModules: true
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
