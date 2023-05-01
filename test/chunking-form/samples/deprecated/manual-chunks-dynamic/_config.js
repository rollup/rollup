module.exports = defineTest({
	description: 'supports dynamic manual chunks',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		manualChunks: {
			dynamic: ['dynamic.js']
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
