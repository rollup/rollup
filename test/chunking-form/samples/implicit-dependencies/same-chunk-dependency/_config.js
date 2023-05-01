const assert = require('node:assert');

let referenceId;

module.exports = defineTest({
	description: 'handles implicit dependencies where the dependant is inlined into the same chunk',
	expectedWarnings: ['CIRCULAR_DEPENDENCY'],
	options: {
		plugins: {
			name: 'test-plugin',
			buildStart() {
				referenceId = this.emitFile({
					type: 'chunk',
					id: 'dep.js',
					implicitlyLoadedAfterOneOf: ['lib.js']
				});
			},
			generateBundle() {
				assert.strictEqual(this.getFileName(referenceId), 'generated-dep.js');
			}
		}
	}
});
