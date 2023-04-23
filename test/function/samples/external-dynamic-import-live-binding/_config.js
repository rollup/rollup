const assert = require('node:assert');

module.exports = defineTest({
	description: 'supports external dynamic imports with live bindings',
	options: {
		external() {
			return true;
		},
		output: { interop: 'auto', dynamicImportInCjs: false }
	},
	context: {
		require(id) {
			switch (id) {
				case 'dep-0': {
					return;
				}
				case 'dep-1': {
					return () => 42;
				}
				case 'dep-2': {
					const exp = {
						value: 1,
						default: 2,
						update() {
							exp.value = 3;
							exp.default = 4;
						}
					};
					Object.defineProperty(exp, '__esModule', { value: true });
					return exp;
				}
				case 'dep-3': {
					let value = 1;
					const exp = {
						get value() {
							return value;
						},
						otherValue: 2,
						update() {
							value = 3;
							exp.otherValue = 4;
						}
					};
					return exp;
				}
				default: {
					throw new Error(`Unexpected id ${id}.`);
				}
			}
		}
	},
	exports(exports) {
		return exports.then(results => {
			assert.deepStrictEqual(results[0], { __proto__: null, default: undefined });
			assert.strictEqual(results[1].default(), 42);

			assert.strictEqual(results[2].value, 1);
			assert.strictEqual(results[2].default, 2);
			results[2].update();
			assert.strictEqual(results[2].value, 3);
			assert.strictEqual(results[2].default, 4);

			assert.strictEqual(results[3].value, 1);
			assert.strictEqual(results[3].otherValue, 2);
			assert.strictEqual(results[3].default.value, 1);
			assert.strictEqual(results[3].default.otherValue, 2);
			results[3].update();
			assert.strictEqual(results[3].value, 3);
			assert.strictEqual(results[3].otherValue, 4);
			assert.strictEqual(results[3].default.value, 3);
			assert.strictEqual(results[3].default.otherValue, 4);
		});
	}
});
