module.exports = defineTest({
	description: 'includes namespaces including external namespaces',
	options: {
		external: ['external']
	},
	context: {
		require(name) {
			if (name === 'external') {
				return { fromExternal: true };
			}
		}
	},
	exports({ test }) {
		test(['value', 'fromExternal']);
	}
});
