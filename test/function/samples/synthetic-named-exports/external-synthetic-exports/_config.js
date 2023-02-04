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
			exporter: 'dep',
			message: 'External "dep" cannot have "syntheticNamedExports" enabled (imported by "main.js").'
		}
	],
	context: {
		require() {
			return 1;
		}
	}
};
