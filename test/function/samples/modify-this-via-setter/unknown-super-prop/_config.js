module.exports = defineRollupTest({
	description: 'handles setters that modify "this" on prototypes for unknown properties',
	context: {
		require() {
			return { unknown: 'prop' };
		}
	},
	options: {
		external: ['external']
	}
});
