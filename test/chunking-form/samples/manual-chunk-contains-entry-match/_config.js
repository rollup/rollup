module.exports = defineTest({
	description:
		'Identifies the entry chunk with the manual chunk that contains it if the aliases match',
	options: {
		input: {
			main: 'main.js'
		},
		output: {
			manualChunks: {
				main: ['outer']
			}
		}
	}
});
