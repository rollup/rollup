const path = require('node:path');

module.exports = defineTest({
	description: 'describes unresolved implicit dependants with attributes in the error message',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				buildStart() {
					this.emitFile({
						type: 'chunk',
						id: 'dep.js',
						implicitlyLoadedAfterOneOf: [{ attributes: { type: 'json' }, rawId: './missing.js' }]
					});
				}
			}
		]
	},
	error: {
		code: 'MISSING_IMPLICIT_DEPENDANT',
		message:
			'Module "./missing.js" with import attributes {"type":"json"} that should be implicitly loaded before "dep.js" could not be resolved.',
		watchFiles: [path.join(__dirname, 'dep.js'), path.join(__dirname, 'main.js')]
	}
});
