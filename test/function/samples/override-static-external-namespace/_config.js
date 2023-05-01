const assert = require('node:assert');

module.exports = defineTest({
	description:
		'allows overriding imports of external namespace reexports without external live-bindings',
	options: {
		external: 'path',
		output: {
			externalLiveBindings: false
		}
	},
	exports(exports) {
		assert.strictEqual(typeof exports.basename, 'function');
		assert.strictEqual(exports.dirname, 'defined');
		assert.strictEqual(exports.join, undefined);
		assert.strictEqual(exports.resolve, undefined);
		exports.reassign();
		assert.strictEqual(exports.resolve, 'defined');
	}
});
