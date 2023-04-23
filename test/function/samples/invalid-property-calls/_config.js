module.exports = defineTest({
	description: 'includes invalid property calls',
	context: { globalFirst: 'first', globalOther: 'other' },
	options: {
		treeshake: {
			propertyReadSideEffects: false,
			tryCatchDeoptimization: false,
			unknownGlobalSideEffects: false
		}
	}
});
