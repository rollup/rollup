module.exports = defineTest({
	description: 'Uses entry alias if manual chunks contain entry chunks with different alias',
	options: {
		strictDeprecations: false,
		input: {
			main: 'main.js',
			main2: 'main2.js'
		},
		manualChunks: {
			outer: ['outer']
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
