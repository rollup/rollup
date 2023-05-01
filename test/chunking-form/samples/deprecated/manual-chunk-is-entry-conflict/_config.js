module.exports = defineTest({
	description: 'Uses entry alias if manual chunks are entry chunks with different alias',
	options: {
		strictDeprecations: false,
		input: {
			main: 'main.js',
			main2: 'main2.js'
		},
		manualChunks: {
			other: ['main']
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
