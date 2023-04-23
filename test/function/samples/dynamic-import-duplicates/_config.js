const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'Dynamic import inlining',
	options: {
		output: { inlineDynamicImports: true }
	},
	exports(exports) {
		assert.equal(exports.x, 41);
		return exports.promise.then(y => {
			assert.equal(y, 42);
		});
	}
});
