const assert = require('node:assert');

module.exports = defineTest({
	description: 'supports dynamically importing a module with synthetic named exports',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				transform(code, id) {
					if (id.endsWith('dep.js')) {
						return { code, syntheticNamedExports: true };
					}
				},
				moduleParsed({ id, syntheticNamedExports }) {
					if (id.endsWith('dep.js')) {
						assert.strictEqual(syntheticNamedExports, true);
					}
				}
			}
		]
	},
	async exports(exports) {
		const namespace = await exports;
		assert.strictEqual(namespace.foo, 'foo');
		assert.strictEqual(namespace.bar, 'bar');
		assert.strictEqual(namespace.baz, undefined);
		assert.deepStrictEqual(namespace.default, { foo: 'foo' });
	}
});
