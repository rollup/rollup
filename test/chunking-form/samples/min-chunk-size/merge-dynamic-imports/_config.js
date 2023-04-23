module.exports = defineTest({
	description: 'merges small chunks with side effects into suitable pure chunks',
	options: {
		output: {
			experimentalMinChunkSize: 100
		}
	}
});
