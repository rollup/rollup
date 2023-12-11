module.exports = defineTest({
	description: 'merges small chunks without side effects into suitable chunks',
	options: {
		output: {
			experimentalMinChunkSize: 100
		}
	}
});
