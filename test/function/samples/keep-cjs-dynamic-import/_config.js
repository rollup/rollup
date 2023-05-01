const assert = require('node:assert');

module.exports = defineTest({
	description: 'keeps dynamic imports in CJS output by default',
	options: { external: ['external-esm'] },
	async exports({ result }) {
		const expected = {
			__proto__: null,
			default: { external: true }
		};
		Object.defineProperty(expected, Symbol.toStringTag, { value: 'Module' });
		assert.deepStrictEqual(await result, expected);
	}
});
