module.exports = defineTest({
	description: 'handles multiple levels of synthetic named exports',
	options: {
		input: ['main.js', 'main2.js', 'main3.js', 'main4.js', 'main5.js'],
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
