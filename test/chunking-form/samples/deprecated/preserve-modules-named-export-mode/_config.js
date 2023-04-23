module.exports = defineTest({
	description: 'respects "named" export mode in all chunks when preserving modules',
	options: {
		strictDeprecations: false,
		input: 'main.js',
		preserveModules: true,
		output: {
			exports: 'named'
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
