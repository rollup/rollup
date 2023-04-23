module.exports = defineTest({
	description: 'manual chunks can contain nested modules',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		manualChunks: {
			manual: ['middle.js', 'inner.js', 'outer.js']
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
