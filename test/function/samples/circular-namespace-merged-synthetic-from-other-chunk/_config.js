const assert = require('node:assert/strict');

module.exports = defineTest({
	description:
		'creates namespace objects early if they merge a synthetic namespace from another chunk',
	options: {
		output: {
			exports: 'named',
			manualChunks: id => (id.endsWith('synth.js') ? 'synth' : undefined)
		},
		plugins: [
			{
				name: 'synthetic-named-exports',
				transform(code, id) {
					if (id.endsWith('synth.js')) return { syntheticNamedExports: true };
				}
			}
		]
	},
	warnings(warnings) {
		assert.deepStrictEqual(
			warnings.map(({ code }) => code),
			['CIRCULAR_DEPENDENCY']
		);
	}
});
