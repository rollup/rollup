const assert = require('node:assert');

module.exports = defineTest({
	description:
		'reexports both a namespace, the namespace as a name and the default export when using compat interop',
	options: {
		external: true,
		output: { exports: 'named', interop: 'compat' }
	},
	context: {
		require: id => {
			if (id === 'external') {
				return {
					__esModule: true,
					default: 'default',
					foo: 'foo'
				};
			}
			throw new Error(`Cannot find module ${id}`);
		}
	},
	exports(exports) {
		assert.deepStrictEqual(exports, {
			default: 'default',
			foo: 'foo',
			external: {
				__esModule: true,
				default: 'default',
				foo: 'foo'
			}
		});
	}
});
