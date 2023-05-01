module.exports = defineTest({
	description: 'merges namespaces without live-bindings',
	options: {
		external: ['external1', 'external2'],
		output: { externalLiveBindings: false },
		plugins: [
			{
				transform() {
					return { syntheticNamedExports: '__synthetic' };
				}
			}
		]
	}
});
