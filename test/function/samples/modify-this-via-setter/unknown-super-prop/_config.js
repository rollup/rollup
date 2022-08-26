module.exports = {
	description: 'handles setters that modify "this" on prototypes for unknown properties',
	context: {
		require(id) {
			return { unknown: 'prop' };
		}
	},
	options: {
		external: ['external']
	}
};
