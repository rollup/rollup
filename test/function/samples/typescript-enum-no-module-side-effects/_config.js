module.exports = defineTest({
	description: 'bundles enums when using moduleSideEffects: false',
	options: {
		treeshake: {
			moduleSideEffects: false
		}
	}
});
