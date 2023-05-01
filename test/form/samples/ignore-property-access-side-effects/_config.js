module.exports = defineTest({
	description:
		'ignore side-effects when accessing properties if treeshake.propertyReadSideEffects is false',
	expectedWarnings: ['EMPTY_BUNDLE'],
	options: {
		treeshake: {
			propertyReadSideEffects: false
		}
	}
});
