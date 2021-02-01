module.exports = {
	description: 'makes sure default exports of synthetic named exports are snapshots',
	options: {
		plugins: {
			transform() {
				return { syntheticNamedExports: '__synthetic' };
			}
		}
	}
};
