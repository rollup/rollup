module.exports = defineTest({
	description: 'manual chunks support',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				lib1: ['lib1.js'],
				deps2and3: ['dep2.js', 'dep3.js']
			}
		}
	}
});
