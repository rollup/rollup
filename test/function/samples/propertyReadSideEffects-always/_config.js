module.exports = defineRollupTest({
	description: 'verify property accesses are retained for getters with side effects',
	options: { treeshake: { propertyReadSideEffects: 'always' } }
});
