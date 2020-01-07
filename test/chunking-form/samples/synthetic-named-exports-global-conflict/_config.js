module.exports = {
	description: 'avoids conflicts with global variables when re-exporting synthetic named exports',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				resolveId(id) {
					return {
						id,
						syntheticNamedExports: true
					};
				}
			}
		]
	}
};
