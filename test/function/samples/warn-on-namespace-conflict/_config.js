const path = require('path');

module.exports = {
	description: 'warns on duplicate export * from',
	warnings: [
		{
			code: 'NAMESPACE_CONFLICT',
			name: 'foo',
			reexporter: path.resolve(__dirname, 'main.js'),
			sources: [
				path.resolve(__dirname, 'foo.js'),
				path.resolve(__dirname, 'deep.js')
			],
			message: `Conflicting namespaces: main.js re-exports 'foo' from both foo.js and deep.js (will be ignored)`
		}
	]
};
