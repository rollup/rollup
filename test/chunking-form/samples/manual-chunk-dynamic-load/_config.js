module.exports = defineTest({
	description:
		'does not extract modules already loaded by the importer of a dynamically loaded manual chunk',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				m: ['m.js']
			}
		}
	}
});
