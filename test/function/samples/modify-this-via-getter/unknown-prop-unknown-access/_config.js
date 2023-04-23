module.exports = defineRollupTest({
	description: 'handles unknown getters that modify "this" for unknown property access',
	context: {
		require() {
			return { unknown: 'prop' };
		}
	},
	options: {
		external: ['external']
	}
});
