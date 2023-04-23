module.exports = defineTest({
	description: 'handles importing a synthetic named export together with the default export',
	options: {
		input: ['main1', 'main2', 'main3'],
		plugins: [
			{
				name: 'test-plugin',
				transform(code) {
					return {
						code,
						syntheticNamedExports: true
					};
				}
			}
		]
	}
});
