// TODO Lukas at the moment, there is probably an "empty" catch-all chunk that is pruned
module.exports = {
	description: 'avoids empty imports if moduleSideEffects are false',
	options: {
		input: ['main1', 'main2'],
		treeshake: {
			moduleSideEffects: false
		}
	}
};
