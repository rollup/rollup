const assert = require('node:assert/strict');

module.exports = defineTest({
	description:
		'keeps for-await loops and await using inside functions out of top-level await detection',
	minNodeVersion: 24,
	async exports({ declaration, expression, arrow, object, Class }) {
		for (const run of [declaration, expression, arrow, object.method, Class.method]) {
			assert.equal(await run(), 1);
		}
	},
	async bundle(bundle) {
		const { output } = await bundle.generate({ format: 'system' });
		assert.match(output[0].code, /execute: \(function/);
	}
});
