const path = require('path');
const assert = require('assert');

module.exports = {
	description: 'ensures external modules have correct names',
	options: {
		external: ['path']
	},
	exports(exports) {
		assert.equal(exports, path.sep);
	}
};
