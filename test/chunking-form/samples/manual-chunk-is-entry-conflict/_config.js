module.exports = {
	description: 'Creates proper facades if manual chunks are entry chunks with different alias',
	options: {
		input: {
			main: 'main.js'
		},
		manualChunks: {
			other: ['main']
		}
	}
};
