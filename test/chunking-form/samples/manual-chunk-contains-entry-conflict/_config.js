module.exports = {
	description: 'Creates proper facades if manual chunks contain entry chunks with different alias',
	options: {
		input: {
			main: 'main.js'
		},
		manualChunks: {
			outer: ['outer']
		}
	}
};
