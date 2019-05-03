module.exports = {
	description:
		'Identifies the entry chunk with the manual chunk that contains it if the aliases match',
	options: {
		input: {
			main: 'main.js'
		},
		manualChunks: {
			main: ['outer']
		}
	}
};
