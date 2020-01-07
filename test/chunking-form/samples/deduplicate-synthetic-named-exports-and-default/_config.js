module.exports = {
	description: 'handles importing a synthetic named export together with the default export',
	options: {
		input: ['main', 'main2'],
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
};
