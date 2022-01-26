const path = require('path');
const DEP_ID = path.join(__dirname, 'dep.js');

module.exports = {
	description: 'synthetic named exports modules need their fallback export',
	options: {
		plugins: [
			{
				transform(code, id) {
					if (id.endsWith('dep.js')) {
						return { code, syntheticNamedExports: '__synthetic' };
					}
				}
			}
		]
	},
	error: {
		code: 'SYNTHETIC_NAMED_EXPORTS_NEED_NAMESPACE_EXPORT',
		id: DEP_ID,
		message: `Module "dep.js" that is marked with 'syntheticNamedExports: "__synthetic"' needs an explicit export named "__synthetic" that does not reexport an unresolved named export of the same module.`,
		watchFiles: [path.join(__dirname, 'main.js'), DEP_ID]
	}
};
