module.exports = defineRollupTest({
	description: 'handles fully deoptimized objects',
	context: {
		require() {
			return { unknown: 'prop' };
		}
	},
	options: {
		external: ['external']
	}
});
