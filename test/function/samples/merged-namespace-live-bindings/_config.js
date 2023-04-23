module.exports = defineTest({
	description: 'respects getters when accessing properties of an instance',
	context: {
		require(id) {
			if (id === 'external') {
				let external = 'original';
				return {
					get external() {
						return external;
					},
					updateExternal() {
						external = 'updated';
					}
				};
			}
			throw new Error(`Unexpected import "${id}".`);
		}
	},
	options: {
		external: ['external']
	}
});
