module.exports = defineTest({
	description:
		'ignore side-effects when accessing unknown globals if treeshake.unknownGlobalSideEffects is false',
	expectedWarnings: ['EMPTY_BUNDLE'],
	options: {
		treeshake: {
			unknownGlobalSideEffects: false
		}
	}
});
