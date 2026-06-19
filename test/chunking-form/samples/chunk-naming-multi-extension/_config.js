module.exports = defineTest({
	description:
		'conflict numbers are inserted before the first extension in multi-extension file names',
	options: {
		input: {
			entryA: 'main1.js',
			entryB: 'main2.js',
			entryC: 'main3.js'
		},
		output: {
			chunkFileNames: 'chunks/chunk.d.ts'
		}
	}
});
