module.exports = {
	description: 'external modules can not have syntheticNamedExports',
	options: {
		plugins: [
			{
				resolveId(id) {
					if (id === 'dep') {
						return {
							id,
							external: true,
							syntheticNamedExports: true
						};
					}
				}
			}
		]
	},
	warnings: [
		{
			code: 'EXTERNAL_SYNTHETIC_EXPORTS',
			importer: 'main.js',
			source: 'dep',
			message: "External 'dep' can not have 'syntheticNamedExports' enabled."
		}
	],
	context: {
		require() {
			return 1;
		}
	}
};
