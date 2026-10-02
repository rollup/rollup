module.exports = defineTest({
	description: 'does not treat the entry point of a manual chunk member as a dynamic entry',
	options: {
		input: ['other.js', 'main.js'],
		output: {
			manualChunks: {
				manual: ['other.js', 'mB.js']
			}
		}
	}
});
