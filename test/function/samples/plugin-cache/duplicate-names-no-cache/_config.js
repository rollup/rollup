module.exports = defineTest({
	description: 'allows plugins to have the same name if they do not access the cache',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				buildStart() {
					return null;
				}
			},
			{
				name: 'test-plugin',
				buildStart() {
					return null;
				}
			}
		]
	}
});
