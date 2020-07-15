const assert = require('assert');

module.exports = {
	description: 'Allows omitting the code that handles external live bindings',
	options: {
		external: () => true,
		output: {
			compact: true,
			externalLiveBindings: false,
			name: 'bundle'
		}
	},
	context: {
		require(id) {
			return { [id]: true, value: id };
		}
	},
	exports(exports) {
		assert.deepStrictEqual(Object.keys(exports), ['external2', 'value', 'external1', 'dynamic']);
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
};
