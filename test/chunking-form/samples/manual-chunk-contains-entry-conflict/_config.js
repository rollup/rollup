module.exports = defineTest({
	expectedWarnings: ['EMPTY_BUNDLE'],
	description: 'Uses entry alias if manual chunks contain entry chunks with different alias',
	options: {
		input: {
			main: 'main.js',
			main2: 'main2.js'
		},
		output: {
			manualChunks: {
				outer: ['outer']
			}
		}
	}
});
