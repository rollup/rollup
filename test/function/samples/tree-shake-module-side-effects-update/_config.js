module.exports = defineTest({
	skip: true,
	description: 'detects variable updates in modules without side effects (#5408)',
	options: {
		treeshake: {
			moduleSideEffects: false
		}
	}
});
