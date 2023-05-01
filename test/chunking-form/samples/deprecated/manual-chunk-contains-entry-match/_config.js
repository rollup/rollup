module.exports = defineTest({
	description:
		'Identifies the entry chunk with the manual chunk that contains it if the aliases match',
	options: {
		strictDeprecations: false,
		input: {
			main: 'main.js'
		},
		manualChunks: {
			main: ['outer']
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
