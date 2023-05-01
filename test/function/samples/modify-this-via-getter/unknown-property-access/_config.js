module.exports = defineTest({
	description: 'handles getters that modify "this" for unknown property access',
	context: {
		require() {
			return { unknown: 'prop' };
		}
	},
	options: {
		external: ['external']
	}
});
