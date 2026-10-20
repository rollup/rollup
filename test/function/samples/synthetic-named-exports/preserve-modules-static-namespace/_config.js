module.exports = defineTest({
	description:
		'includes synthetic named exports in static namespace imports in preserveModules mode',
	options: {
		output: {
			preserveModules: true
		},
		plugins: [
			{
				name: 'test',
				transform(code, id) {
					if (id.endsWith('other.js')) {
						return { syntheticNamedExports: '__synthetic' };
					}
				}
			}
		]
	}
});
