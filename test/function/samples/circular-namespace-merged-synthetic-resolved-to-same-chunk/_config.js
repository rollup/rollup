const assert = require('node:assert/strict');

module.exports = defineTest({
	description:
		'does not create namespace objects early if a synthetic namespace from another chunk resolves to a variable of this chunk',
	options: {
		output: {
			manualChunks(id) {
				if (id.endsWith('synth.js')) return 'synth';
				if (!id.endsWith('main.js')) return 'impl';
			}
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
