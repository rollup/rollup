module.exports = defineTest({
	description: 'handles name conflicts in manual chunks',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		manualChunks: {
			dynamic: ['dynamic1.js']
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
