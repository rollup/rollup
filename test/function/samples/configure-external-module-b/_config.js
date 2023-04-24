const assert = require('node:assert');

module.exports = defineTest({
	description: 'allows external module to be configured (b)',
	options: {
		external: ['path']
	},
	exports() {
		// @ts-expect-error missing types
		assert.equal(require('node:path').resolve.configured, 'yes');
	}
});
