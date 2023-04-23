module.exports = defineRollupTest({
	description: 'handles deeply nested properties',
	options: {
		treeshake: { propertyReadSideEffects: false }
	}
});
