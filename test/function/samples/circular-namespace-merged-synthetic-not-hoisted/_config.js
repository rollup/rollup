const assert = require('node:assert/strict');

module.exports = defineTest({
	description:
		'does not create namespace objects early if they merge a synthetic namespace from a module that has not run yet',
	options: {
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
		assert.strictEqual(warnings.length, 1);
		assert.strictEqual(warnings[0].code, 'CIRCULAR_DEPENDENCY');
	}
});
