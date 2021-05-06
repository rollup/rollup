module.exports = {
	description: 'handles unknown getters that modify "this" for unknown property access',
	context: {
		require(id) {
			return { unknown: 'prop' };
		}
	},
	options: {
		external: ['external']
	}
};
