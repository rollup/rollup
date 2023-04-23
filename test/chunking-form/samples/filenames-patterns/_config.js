module.exports = defineTest({
	description: 'filenames custom pattern',
	options: {
		input: ['main1.js', 'main2.js'],
		output: {
			entryFileNames: 'entry-[name]-[hash]-[format].js',
			chunkFileNames: 'chunk-[name]-[hash]-[format].js'
		}
	}
});
