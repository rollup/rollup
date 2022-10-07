const assert = require('node:assert');
const path = require('node:path');

module.exports = {
	description: 'ensures external modules have correct names',
	options: {
		external: ['path']
	},
	exports(exports) {
		assert.equal(exports, path.sep);
	}
};
