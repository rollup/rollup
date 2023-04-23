module.exports = defineRollupTest({
	description: 'uses an unknown value for nested properties',
	options: {
		treeshake: { propertyReadSideEffects: false }
	}
});
