module.exports = defineTest({
	description: 'allows using the path option selectively',
	options: {
		external: ['dep-a', 'dep-b'],
		output: {
			paths: {
				'dep-a': 'secret-dep'
			}
		}
	},
	context: {
		require(id) {
			if (id === 'secret-dep') {
				return 'secret';
			}
			if (id === 'dep-b') {
				return 'b';
			}
			throw new Error(`Unexpected dependency ${id}`);
		}
	}
});
