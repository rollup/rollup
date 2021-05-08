module.exports = {
	description: 'handles fully deoptimized objects',
	context: {
		require(id) {
			return { unknown: 'prop' };
		}
	},
	options: {
		external: ['external']
	}
};
