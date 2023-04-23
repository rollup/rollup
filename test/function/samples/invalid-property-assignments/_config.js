module.exports = defineTest({
	description: 'includes invalid property assignments',
	context: { globalOther: 'other' },
	options: {
		treeshake: {
			propertyReadSideEffects: false,
			tryCatchDeoptimization: false,
			unknownGlobalSideEffects: false
		}
	}
});
