module.exports = defineTest({
	description: 'manual chunks can have other manual chunks as dependencies',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				'manual-outer': ['outer.js'],
				'manual-inner': ['inner.js'],
				'manual-middle': ['middle.js']
			}
		}
	}
});
