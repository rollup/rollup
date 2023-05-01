const assert = require('node:assert');

module.exports = defineTest({
	description: 'allows reexporting a namespace as a name when interop is "defaultOnly"',
	options: {
		external: 'external',
		output: {
			interop: 'defaultOnly'
		}
	},
	exports(exports) {
		assert.deepStrictEqual(exports, { foo: { __proto__: null, default: { external: true } } });
	}
});
