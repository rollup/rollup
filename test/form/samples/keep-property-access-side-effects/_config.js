module.exports = defineTest({
	description:
		'keep side-effects when accessing properties if treeshake.propertyReadSideEffects is true',
	options: {
		treeshake: {
			propertyReadSideEffects: true
		}
	}
});
