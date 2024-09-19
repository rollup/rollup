module.exports = defineTest({
	description: 'detects variable updates in modules without side effects (#5408)',
	options: {
		treeshake: {
			moduleSideEffects: false
		}
	}
});
