module.exports = defineTest({
	description: 'handles deeply nested properties',
	options: {
		treeshake: { propertyReadSideEffects: false }
	}
});
