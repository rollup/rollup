module.exports = defineTest({
	description: 'avoids empty imports if they do not have side-effects',
	options: {
		input: ['main1', 'main2'],
		external: ['external-side-effect']
	}
});
