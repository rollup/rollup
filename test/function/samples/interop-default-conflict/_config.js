const assert = require('node:assert');

let bar = 'initial bar';
let defaultValue = 'initial foo';

module.exports = defineTest({
	description:
		'handles conflicts with added interop default variables and supports default live bindings',
	options: {
		external: 'external',
		output: { interop: 'compat' }
	},
	context: {
		require() {
			return {
				get default() {
					return defaultValue;
				},
				get bar() {
					return bar;
				},
				__esModule: true
			};
		}
	},
	exports(exports) {
		assert.deepStrictEqual(exports, {
			foo: 'initial foo',
			bar: 'initial bar',
			foo__default: 1,
			external__default: 2
		});
		defaultValue = 'new foo';
		bar = 'new bar';
		assert.deepStrictEqual(exports, {
			foo: 'new foo',
			bar: 'new bar',
			foo__default: 1,
			external__default: 2
		});
	}
});
