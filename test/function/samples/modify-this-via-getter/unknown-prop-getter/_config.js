module.exports = defineTest({
	description: 'handles unknown getters that modify "this"',
	context: {
		require() {
			return { unknown: 'prop' };
		}
	},
	options: {
		external: ['external']
	}
});
