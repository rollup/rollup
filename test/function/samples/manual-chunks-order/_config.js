module.exports = defineTest({
	description: 'sorts manual chunks by entry index',
	options: {
		output: {
			manualChunks: {
				chunk1: ['module1.js'],
				chunk2: ['module2.js']
			}
		}
	}
});
