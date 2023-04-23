module.exports = defineTest({
	description: 'manual chunks support',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		manualChunks: {
			lib1: ['lib1.js'],
			deps2and3: ['dep2.js', 'dep3.js']
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
