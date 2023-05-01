module.exports = defineTest({
	description: 'creates different hashes if the names of external dependencies differ',
	options1: {
		input: { mainA: 'main1a', mainB: 'main1b' },
		external: ['external', 'external1']
	},
	options2: {
		input: { mainA: 'main2a', mainB: 'main2b' },
		external: ['external', 'external2']
	}
});
