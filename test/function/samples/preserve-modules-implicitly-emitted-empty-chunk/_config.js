const assert = require('node:assert');
const path = require('node:path');

let referenceId;

module.exports = defineTest({
	description:
		'emits a tree-shaken module that is emitted as an implicit entry when preserving modules',
	options: {
		output: {
			preserveModules: true
		},
		plugins: {
			name: 'test-plugin',
			buildStart() {
				referenceId = this.emitFile({
					type: 'chunk',
					id: path.join(__dirname, 'implicit.js'),
					implicitlyLoadedAfterOneOf: [path.join(__dirname, 'main.js')]
				});
			},
			generateBundle() {
				assert.strictEqual(this.getFileName(referenceId), 'implicit.js');
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
