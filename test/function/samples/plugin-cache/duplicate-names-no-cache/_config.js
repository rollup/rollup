module.exports = {
	description: 'allows plugins to have the same name if they do not access the cache',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				buildStart() {}
			},
			{
				name: 'test-plugin',
				buildStart() {}
			}
		]
	}
};
