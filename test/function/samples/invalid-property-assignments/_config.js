module.exports = {
	description: 'includes invalid property assignments',
	options: {
		treeshake: { propertyReadSideEffects: false, tryCatchDeoptimization: false }
	}
};
