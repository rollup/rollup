module.exports = defineTest({
	description:
		'keeps a dynamically loaded manual chunk that is already loaded by its importer as its own chunk',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				manual: ['mA.js', 'mB.js']
			}
		}
	}
});
