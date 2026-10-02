module.exports = defineTest({
	description:
		'does not execute side effects of manual chunk members in an entry when merging chunks below minChunkSize',
	options: {
		input: ['main.js', 'main2.js', 'main3.js'],
		output: {
			experimentalMinChunkSize: 1000,
			manualChunks: id => (id.endsWith('m.js') ? 'manual' : undefined)
		}
	}
});
