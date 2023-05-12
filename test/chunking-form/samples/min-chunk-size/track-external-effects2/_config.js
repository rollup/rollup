module.exports = defineTest({
	description:
		'does not tracks external imports as side effects if they are marked as side effect free',
	options: {
		input: ['main1.js', 'main2.js'],
		external: ['external1', 'external2'],
		treeshake: {
			moduleSideEffects: 'no-external'
		},
		output: {
			experimentalMinChunkSize: 100
		}
	}
});
