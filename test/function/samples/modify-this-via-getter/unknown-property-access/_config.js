module.exports = {
	description: 'handles getters that modify "this" for unknown property access',
	context: {
		require(id) {
			return { unknown: 'prop' };
		}
	},
	options: {
		external: ['external']
	}
};
