module.exports = defineTest({
	description: 'respect side-effects in reexporting modules even if moduleSideEffects are off',
	options: {
		treeshake: {
			moduleSideEffects: false
		}
	}
});
