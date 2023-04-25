module.exports = defineTest({
	description: 'merges namespaces with live-bindings',
	options: {
		external: ['external1', 'external2'],
		plugins: [
			{
				name: 'test',
				transform() {
					return { syntheticNamedExports: '__synthetic' };
				}
			}
		]
	}
});
