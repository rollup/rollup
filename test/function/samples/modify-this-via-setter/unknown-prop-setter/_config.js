module.exports = {
	description: 'handles unknown setters that modify "this"',
	context: {
		require(id) {
			return { unknown: 'prop' };
		}
	},
	options: {
		external: ['external']
	}
};
