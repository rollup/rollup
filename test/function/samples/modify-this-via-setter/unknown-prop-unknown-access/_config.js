module.exports = {
	description: 'handles unknown setters that modify "this" for unknown property access',
	context: {
		require(id) {
			return { unknown: 'prop' };
		}
	},
	options: {
		external: ['external']
	}
};
