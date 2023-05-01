module.exports = defineTest({
	description: 'handles adding or deleting symbols in generateBundle',
	options: {
		plugins: [
			{
				name: 'test',
				generateBundle(options, bundle) {
					const myKey = Symbol('test');
					bundle[myKey] = 42;
					delete bundle[myKey];
				}
			}
		]
	}
});
