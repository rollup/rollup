const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_DEP = path.join(__dirname, 'dep.js');

module.exports = defineTest({
	description: 'handles circular synthetic exports',
	options: {
		plugins: [
			{
				name: 'test',
				transform() {
					return { syntheticNamedExports: '__synthetic' };
				}
			}
		]
	},
	error: {
		code: 'SYNTHETIC_NAMED_EXPORTS_NEED_NAMESPACE_EXPORT',
		exporter: ID_MAIN,
		watchFiles: [ID_DEP, ID_MAIN],
		message:
			'Module "main.js" that is marked with `syntheticNamedExports: "__synthetic"` needs an explicit export named "__synthetic" that does not reexport an unresolved named export of the same module.'
	}
});
