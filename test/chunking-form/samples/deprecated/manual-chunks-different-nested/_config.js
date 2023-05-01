module.exports = defineTest({
	description: 'manual chunks can have other manual chunks as dependencies',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		manualChunks: {
			'manual-outer': ['outer.js'],
			'manual-inner': ['inner.js'],
			'manual-middle': ['middle.js']
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
