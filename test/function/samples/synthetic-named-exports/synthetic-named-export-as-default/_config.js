module.exports = defineTest({
	description: 'makes sure default exports of synthetic named exports are snapshots',
	options: {
		plugins: {
			name: 'test-plugin',
			transform() {
				return { syntheticNamedExports: '__synthetic' };
			}
		}
	}
});
