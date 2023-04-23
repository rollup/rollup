module.exports = defineTest({
	description: 'deduplicates hashes for identical files',
	options: {
		input: ['main1', 'main2'],
		output: { entryFileNames: 'entry-[hash].js' }
	}
});
