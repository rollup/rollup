module.exports = defineTest({
	description: 'handles getters that modify "this" on prototypes for unknown properties',
	context: {
		require() {
			return { unknown: 'prop' };
		}
	},
	options: {
		external: ['external']
	}
});
