module.exports = defineTest({
	description: 'handles unknown setters that modify "this" for unknown property access',
	context: {
		require() {
			return { unknown: 'prop' };
		}
	},
	options: {
		external: ['external']
	}
});
