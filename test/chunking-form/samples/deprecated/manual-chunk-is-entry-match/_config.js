module.exports = defineTest({
	description:
		'Identifies the entry chunk with the manual chunk that has the same entry if the aliases match',
	options: {
		strictDeprecations: false,
		input: {
			main: 'main.js'
		},
		manualChunks: {
			main: ['main']
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
