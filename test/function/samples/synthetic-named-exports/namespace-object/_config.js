const assert = require('node:assert');

module.exports = defineTest({
	description: 'does not include named synthetic namespaces in namespace objects',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				transform(code, id) {
					if (id.endsWith('synthetic.js')) {
						return {
							code,
							syntheticNamedExports: '__moduleExports'
						};
					}
				}
			}
		]
	},
	exports(exports) {
		assert.deepStrictEqual(exports, {
			synthetic: {
				__proto__: null,
				default: 'default',
				foo: 'synthetic-foo'
			}
		});
	}
});
