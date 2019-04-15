module.exports = {
	description:
		'Identifies the entry chunk with the manual chunk that has the same entry if the aliases match',
	options: {
		input: {
			main: 'main.js'
		},
		manualChunks: {
			main: ['main']
		}
	}
};
