const path = require('node:path');

module.exports = defineTest({
	description:
		'keeps dependencies shared with the entry in the entry chunk when a manual chunk member is implicitly loaded after it',
	formats: ['es', 'system'],
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				manual: ['implicit.js']
			}
		},
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.emitFile({
					type: 'chunk',
					id: path.join(__dirname, 'implicit.js'),
					implicitlyLoadedAfterOneOf: [path.join(__dirname, 'main.js')]
				});
			}
		}
	}
});
