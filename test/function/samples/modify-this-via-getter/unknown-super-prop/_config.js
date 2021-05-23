module.exports = {
	description: 'handles getters that modify "this" on prototypes for unknown properties',
	minNodeVersion: 12,
	context: {
		require(id) {
			return { unknown: 'prop' };
		}
	},
	options: {
		external: ['external']
	}
};
