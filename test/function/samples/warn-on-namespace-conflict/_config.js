const path = require('path');

module.exports = {
	description: 'warns on duplicate export * from',
	warnings: [
		{
			code: 'NAMESPACE_CONFLICT',
			name: 'foo',
			reexporter: path.join(__dirname, 'main.js'),
			sources: [path.join(__dirname, 'foo.js'), path.join(__dirname, 'bar.js')],
			message: `Conflicting namespaces: "main.js" re-exports "foo" from one of the modules "foo.js" and "bar.js" (will be ignored)`
		}
	]
};
