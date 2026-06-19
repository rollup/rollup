module.exports = defineTest({
	description:
		'preserves the leading dot of hidden file names when inserting conflict numbers before the first extension',
	options: {
		input: {
			entryA: 'main1.js',
			entryB: 'main2.js',
			entryC: 'main3.js'
		},
		output: {
			chunkFileNames: '.env.local'
		}
	}
});
