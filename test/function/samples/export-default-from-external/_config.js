const assert = require('node:assert');
const path = require('node:path');

module.exports = defineRollupTest({
	description: 'ensures external modules have correct names',
	options: {
		external: ['path']
	},
	exports(exports) {
		assert.equal(exports, path.sep);
	}
});
