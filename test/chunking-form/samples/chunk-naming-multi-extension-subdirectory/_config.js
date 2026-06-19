module.exports = defineTest({
	description:
		'conflict numbers are not inserted into directory segments containing dots in multi-extension file names',
	options: {
		input: {
			entryA: 'main1.js',
			entryB: 'main2.js',
			entryC: 'main3.js'
		},
		output: {
			chunkFileNames: 'v1.0/chunk.d.ts'
		}
	}
});
