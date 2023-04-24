const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_DEP = path.join(__dirname, 'dep.js');

module.exports = defineTest({
	description: 'synthetic named exports modules need their fallback export',
	options: {
		plugins: [
			{
				name: 'test-plugin',
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
		exporter: ID_DEP,
		watchFiles: [ID_DEP, ID_MAIN],
		message:
			'Module "dep.js" that is marked with `syntheticNamedExports: "__synthetic"` needs an explicit export named "__synthetic" that does not reexport an unresolved named export of the same module.'
	}
});
