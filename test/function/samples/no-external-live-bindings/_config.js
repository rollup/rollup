const assert = require('node:assert');

module.exports = defineTest({
	description: 'Allows omitting the code that handles external live bindings',
	options: {
		external: () => true,
		output: {
			externalLiveBindings: false,
			name: 'bundle',
			dynamicImportInCjs: false
		}
	},
	context: {
		require(id) {
			return { [id]: true, value: id };
		}
	},
	exports(exports) {
		assert.deepStrictEqual(Object.keys(exports).sort(), [
			'dynamic',
			'external1',
			'external2',
			'value'
		]);
		assert.strictEqual(exports.external1, true);
		assert.strictEqual(exports.external2, true);
		assert.strictEqual(exports.value, 'external2');
		return exports.dynamic.then(dynamic =>
			assert.deepStrictEqual(dynamic, {
				__proto__: null,
				external3: true,
				value: 'external3',
				default: { external3: true, value: 'external3' }
			})
		);
	}
});
