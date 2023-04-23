const assert = require('node:assert');

module.exports = defineTest({
	description:
		'handles reexports when creating a facade chunk and transitive dependencies are not hoisted',
	options: {
		input: ['main', 'other'],
		external: 'external',
		output: { hoistTransitiveImports: false }
	},
	async exports(exports) {
		assert.strictEqual(exports.other, 'other');
		assert.strictEqual(exports.external, true);
		assert.strictEqual(await exports.dynamic(), 'liblib');
	}
});
