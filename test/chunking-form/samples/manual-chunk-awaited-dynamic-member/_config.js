module.exports = defineTest({
	description:
		'treats an awaited dynamic import of a manual chunk member as an awaited dynamic entry',
	formats: ['es', 'system'],
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				manual: ['m.js']
			}
		}
	}
});
