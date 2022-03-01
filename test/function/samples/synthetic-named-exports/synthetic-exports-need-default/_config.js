const path = require('path');

module.exports = {
	description: 'synthetic named exports modules need a default export',
	options: {
		plugins: [
			{
				transform() {
					return { syntheticNamedExports: true };
				}
			}
		]
	},
	error: {
		code: 'SYNTHETIC_NAMED_EXPORTS_NEED_NAMESPACE_EXPORT',
		id: path.join(__dirname, 'dep.js'),
		message: `Module "dep.js" that is marked with 'syntheticNamedExports: true' needs a default export that does not reexport an unresolved named export of the same module.`,
		watchFiles: [path.join(__dirname, 'dep.js'), path.join(__dirname, 'main.js')]
	}
};
