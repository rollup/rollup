module.exports = {
	description: 'Uses entry alias if manual chunks are entry chunks with different alias',
	options: {
		input: {
			main: 'main.js',
			main2: 'main2.js'
		},
		manualChunks: {
			other: ['main']
		}
	}
};
