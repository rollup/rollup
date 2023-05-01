module.exports = defineTest({
	description: 'creates facades for dynamic manual chunks if necessary',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		manualChunks: {
			dynamic: ['dynamic1.js']
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
