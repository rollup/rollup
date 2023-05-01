const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_FOO = path.join(__dirname, 'foo.js');
const ID_BAR = path.join(__dirname, 'bar.js');

module.exports = defineTest({
	description: 'warns on duplicate export * from',
	warnings: [
		{
			binding: 'foo',
			code: 'NAMESPACE_CONFLICT',
			ids: [ID_FOO, ID_BAR],
			message:
				'Conflicting namespaces: "main.js" re-exports "foo" from one of the modules "foo.js" and "bar.js" (will be ignored).',
			reexporter: ID_MAIN
		}
	]
});
