module.exports = defineTest({
	description: 'avoids conflicts with global variables when re-exporting synthetic named exports',
	options: {
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
