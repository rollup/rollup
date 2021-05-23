module.exports = {
	description: 'handles unknown getters that modify "this"',
	context: {
		require(id) {
			return { unknown: 'prop' };
		}
	},
	options: {
		external: ['external']
	}
};
