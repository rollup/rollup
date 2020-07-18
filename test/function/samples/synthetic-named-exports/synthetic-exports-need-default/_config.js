const path = require('path');

module.exports = {
	description: 'synthetic named exports modules need a default export',
	options: {
		plugins: [
			{
				resolveId(id) {
					if (id === './dep.js') {
						return {
							id,
							syntheticNamedExports: true
						};
					}
				}
			}
		]
	},
	error: {
		code: 'SYNTHETIC_NAMED_EXPORTS_NEED_NAMESPACE_EXPORT',
		id: './dep.js',
		message: `Module "./dep.js" that is marked with 'syntheticNamedExports: true' needs a default export.`,
		watchFiles: [path.resolve(__dirname, 'main.js'), './dep.js']
	}
};
