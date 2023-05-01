module.exports = defineTest({
	description: 'handles re-exports in entry points if moduleSideEffects are false',
	options: {
		treeshake: {
			moduleSideEffects: false
		}
	}
});
