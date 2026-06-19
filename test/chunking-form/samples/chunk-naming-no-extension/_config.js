module.exports = defineTest({
	description: 'inserts conflict numbers at the end of the file name when there is no extension',
	options: {
		input: {
			entryA: 'main1.js',
			entryB: 'main2.js',
			entryC: 'main3.js'
		},
		output: {
			chunkFileNames: 'chunk'
		}
	}
});
