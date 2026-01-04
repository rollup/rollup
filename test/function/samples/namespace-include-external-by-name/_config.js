module.exports = defineTest({
	description: 'includes members from external namespaces',
	options: {
		external: ['external']
	},
	context: {
		require(name) {
			if (name === 'external') {
				return { fromExternal: true };
			}
		}
	}
});
