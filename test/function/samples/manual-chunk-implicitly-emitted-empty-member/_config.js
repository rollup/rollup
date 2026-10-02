const path = require('node:path');

module.exports = defineTest({
	description:
		'does not warn about an empty manual chunk when its only member is emitted as an empty implicit entry',
	options: {
		output: {
			manualChunks: {
				manual: [path.join(__dirname, 'implicit.js')]
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
	},
	warnings: [
		{
			code: 'EMPTY_BUNDLE',
			message: 'Generated an empty chunk: "implicit".',
			names: ['implicit']
		}
	]
});
