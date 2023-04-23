const assert = require('node:assert');

module.exports = defineTest({
	description:
		'deconflicts variables when nested dynamic imports are inlined via inlineDynamicImports',
	options: {
		output: { inlineDynamicImports: true }
	},
	exports(exports) {
		return exports().then(result => assert.strictEqual(result, 43));
	}
});
