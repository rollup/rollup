const path = require('node:path');

module.exports = defineTest({
	description: 'throws when a module that is loaded before an emitted chunk does not exist',
	options: {
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.emitFile({
					type: 'chunk',
					id: 'dep.js',
					implicitlyLoadedAfterOneOf: ['does-not-exist']
				});
			}
		}
	},
	error: {
		code: 'MISSING_IMPLICIT_DEPENDANT',
		message:
			'Module "does-not-exist" that should be implicitly loaded before "dep.js" could not be resolved.',
		watchFiles: [path.join(__dirname, 'dep.js'), path.join(__dirname, 'main.js')]
	}
});
