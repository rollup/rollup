module.exports = defineTest({
	description: 'avoids empty imports if moduleSideEffects are false',
	options: {
		input: ['main1', 'main2'],
		treeshake: {
			moduleSideEffects: false
		}
	}
});
