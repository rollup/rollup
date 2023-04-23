module.exports = defineTest({
	description: 'Preserve modules properly handles internal namespace imports (#2576)',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		preserveModules: true
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
