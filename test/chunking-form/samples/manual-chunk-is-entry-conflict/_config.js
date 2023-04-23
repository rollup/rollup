module.exports = defineTest({
	description: 'Uses entry alias if manual chunks are entry chunks with different alias',
	options: {
		input: {
			main: 'main.js',
			main2: 'main2.js'
		},
		output: {
			manualChunks: {
				other: ['main']
			}
		}
	}
});
