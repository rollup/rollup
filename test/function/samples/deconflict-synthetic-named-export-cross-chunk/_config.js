const assert = require('node:assert');

module.exports = defineTest({
	description: 'deconflicts synthetic named exports across chunks',
	options: {
		input: ['main', 'foo'],
		preserveEntrySignatures: 'allow-extension',
		plugins: [
			{
				transform(code) {
					return { code, syntheticNamedExports: 'bar' };
				}
			}
		]
	},
	exports(exports) {
		assert.strictEqual(exports(2), 4);
	}
});
