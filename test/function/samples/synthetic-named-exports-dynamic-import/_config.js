const assert = require('assert');

module.exports = {
	description: 'supports dynamically importing a module with synthetic named exports',
	options: {
		plugins: [
			{
				transform(code, id) {
					if (id.endsWith('dep.js')) {
						return { code, syntheticNamedExports: true };
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
};
