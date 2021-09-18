module.exports = {
	description: 'merges namespaces with live-bindings',
	options: {
		external: ['external1', 'external2'],
		plugins: [
			{
				transform() {
					return { syntheticNamedExports: '__synthetic' };
				}
			}
		]
	}
};
