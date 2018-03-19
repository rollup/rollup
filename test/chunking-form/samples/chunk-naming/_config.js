module.exports = {
	description: 'simple chunking',
	options: {
		input: {
			'entryA': 'main1.js',
			'entryB': 'main2.js',
			'custom/entryC': 'main3.js'
		},
		output: {
			chunkNames: 'chunks/chunk'
		}
	}
};
