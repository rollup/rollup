const path = require('path');

module.exports = {
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
	generateError: {
		code: 'SYNTHETIC_NAMED_EXPORTS_NEED_NAMESPACE_EXPORT',
		id: path.join(__dirname, 'main.js'),
		message: `Module "main.js" that is marked with 'syntheticNamedExports: "__synthetic"' needs an export named "__synthetic" that does not reexport an unresolved named export of the same module.`
	}
};
